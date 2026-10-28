"""Build static Pages files; refresh public colour headlines without user data."""
import argparse
import concurrent.futures
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime
import html
import json
from pathlib import Path
import re
import shutil
import urllib.request
from urllib.parse import urlsplit
import xml.etree.ElementTree as ET

FEEDS = [
    ('Dezeen', 'https://www.dezeen.com/tag/colour/feed/'),
    ('Design Milk', 'https://design-milk.com/category/interior-design/feed/'),
]
HOSTS = {'www.dezeen.com', 'dezeen.com', 'design-milk.com', 'www.design-milk.com'}
ASSETS = ['index.html', 'app.js', 'color.mjs', 'recommendations.mjs', 'style.css',
          'sw.js', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png']
KEYWORDS = re.compile(r'\b(colou?r\w*|palette\w*|paint\w*)\b', re.I)

def read_url(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'HuePocket/1.0 (public colour headlines)'})
    with urllib.request.urlopen(req, timeout=20) as response:
        data = response.read(4_000_001)
    if len(data) > 4_000_000:
        raise ValueError('Feed exceeds size limit')
    return data

def parse_feed(data, source, now):
    if b'<!DOCTYPE' in data.upper() or b'<!ENTITY' in data.upper():
        raise ValueError('Unexpected XML declaration')
    root = ET.fromstring(data)
    if root.tag != 'rss' or root.find('channel') is None:
        raise ValueError('Not an RSS feed')
    items = []
    for entry in root.findall('./channel/item'):
        title = html.unescape(entry.findtext('title', '')).strip()
        url = entry.findtext('link', '').strip()
        description = entry.findtext('description', '')
        try:
            published = parsedate_to_datetime(entry.findtext('pubDate', ''))
            if published.tzinfo is None:
                published = published.replace(tzinfo=timezone.utc)
            parsed = urlsplit(url)
            if parsed.scheme != 'https' or parsed.hostname not in HOSTS:
                continue
            if not now-timedelta(days=180) <= published <= now+timedelta(days=1):
                continue
        except (TypeError, ValueError, OverflowError):
            continue
        if not title or not KEYWORDS.search(title+' '+description):
            continue
        items.append({'title': title[:200], 'url': url, 'source': source,
                      'publishedAt': published.astimezone(timezone.utc).isoformat()})
    return items

def refresh(previous):
    now = datetime.now(timezone.utc)
    previous = previous if isinstance(previous, dict) else {}
    items, sources = [], []
    def fetch(source, url):
        return parse_feed(read_url(url), source, now)
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        futures = [(name, url, pool.submit(fetch, name, url)) for name, url in FEEDS]
        for name, url, future in futures:
            try:
                fresh = future.result()
                items.extend(fresh)
                sources.append({'name': name, 'url': url, 'ok': True, 'fetchedAt': now.isoformat()})
                print(f'{name}: fetched {len(fresh)} recent colour headlines')
            except Exception as error:
                items.extend(x for x in previous.get('items', []) if x.get('source') == name)
                sources.append({'name': name, 'url': url, 'ok': False})
                print(f'{name}: retaining previous headlines ({type(error).__name__})')
    unique = {x['url']: x for x in items}
    items = sorted(unique.values(), key=lambda x: x['publishedAt'], reverse=True)[:8]
    return {'checkedAt': now.isoformat(),
            'updatedAt': now.isoformat() if any(s['ok'] for s in sources) else previous.get('updatedAt'),
            'partial': any(not s['ok'] for s in sources), 'sources': sources, 'items': items}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--site-dir', default='.')
    parser.add_argument('--output', default='_site')
    parser.add_argument('--previous-url')
    args = parser.parse_args()
    source, output = Path(args.site_dir).resolve(), Path(args.output).resolve()
    if source == output:
        raise ValueError('Output must differ from source')
    output.mkdir(parents=True, exist_ok=True)
    for name in ASSETS:
        shutil.copy2(source/name, output/name)
    (output/'.nojekyll').touch()
    if (source/'CNAME').exists():
        shutil.copy2(source/'CNAME', output/'CNAME')
    previous = {}
    try:
        previous = json.loads((source/'trend-news.json').read_text(encoding='utf-8'))
    except (FileNotFoundError, ValueError):
        pass
    if args.previous_url:
        try:
            live = json.loads(read_url(args.previous_url))
            if isinstance(live, dict) and isinstance(live.get('items'), list):
                previous = live
        except Exception:
            print('Previous deployment unavailable; using bundled headlines')
    (output/'trend-news.json').write_text(json.dumps(refresh(previous), ensure_ascii=False, indent=2)+'\n', encoding='utf-8')

if __name__ == '__main__':
    main()
