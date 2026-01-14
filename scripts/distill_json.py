#!/usr/bin/env python3
"""
Distill X bookmarks JSON to minimal essential fields for categorization.
Removes: extended_media, profile_image_url_https, and unused fields.
"""

import json
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_FILE = os.path.join(SCRIPT_DIR, '..', 'data', 'exports', 'bookmarks_2026-01-13-1528.json')
OUTPUT_FILE = os.path.join(SCRIPT_DIR, '..', 'data', 'distilled', 'bookmarks_distilled.json')

def distill_tweet(bookmark):
    media_type = 'none'
    video_url = None
    
    extended_media = bookmark.get('extended_media', [])
    if extended_media:
        first_media = extended_media[0]
        media_type_raw = first_media.get('type', 'none')
        if media_type_raw == 'video' or media_type_raw == 'animated_gif':
            media_type = 'video'
            video_url = first_media.get('expanded_url', None)
        elif media_type_raw == 'photo':
            media_type = 'image'
    
    tweet_date = None
    if bookmark.get('tweeted_at'):
        tweet_date = bookmark['tweeted_at'][:10]
    
    bookmark_date = None
    if bookmark.get('bookmark_date'):
        bookmark_date = bookmark['bookmark_date'][:10]
    
    return {
        'tweet_url': bookmark.get('tweet_url', ''),
        'author': bookmark.get('screen_name', ''),
        'author_name': bookmark.get('name', ''),
        'full_text': bookmark.get('full_text', ''),
        'note_tweet_text': bookmark.get('note_tweet_text', '') or '',
        'tweet_date': tweet_date,
        'bookmark_date': bookmark_date,
        'media_type': media_type,
        'image_path': None,
        'video_url': video_url,
        'primary_category': None,
        'subtags': [],
        'cognitive_value': ''
    }

def main():
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        bookmarks = json.load(f)

    original_size = sum(len(json.dumps(b)) for b in bookmarks)
    distilled = [distill_tweet(b) for b in bookmarks]
    distilled_size = sum(len(json.dumps(d)) for d in distilled)

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(distilled, f, indent=2, ensure_ascii=False)

    reduction = ((original_size - distilled_size) / original_size) * 100
    
    print(f'Distilled {len(bookmarks)} tweets')
    print(f'Original size: {original_size:,} bytes')
    print(f'Distilled size: {distilled_size:,} bytes')
    print(f'Reduction: {reduction:.1f}%')
    print(f'Output: {OUTPUT_FILE}')

if __name__ == '__main__':
    main()
