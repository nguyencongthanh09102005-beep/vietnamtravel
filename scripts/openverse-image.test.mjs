import assert from 'node:assert/strict';
import { test } from 'node:test';
const { searchOpenverseImageCandidates } =
  await import('../.api-test-dist/api/_lib/photo-queue.js');

test('Openverse provides licensed review candidates only, never uncontrolled image hosts', async () => {
  const fetcher = async input => {
    const uri = new URL(input);
    assert.equal(uri.hostname, 'api.openverse.org');
    assert.equal(uri.pathname, '/v1/images/');
    assert.equal(uri.searchParams.get('license_type'), 'commercial');
    return Response.json({ results: [
      { creator:'Contributor',license:'by',license_version:'4.0',
        url:'https://live.staticflickr.com/1234/12345_abcd_c.jpg',
        foreign_landing_url:'https://www.flickr.com/photos/abc123/12345/',
        width:1200,height:900 },
      { creator:'Photographer',license:'by-sa',license_version:'3.0',
        url:'https://upload.wikimedia.org/wikipedia/commons/a/ab/subject.jpg',
        foreign_landing_url:'https://commons.wikimedia.org/wiki/File:subject.jpg',
        width:1400,height:800 },
      { creator:'Another',license:'by-nc',license_version:'4.0',
        url:'https://live.staticflickr.com/1234/44445_abcd_c.jpg',
        foreign_landing_url:'https://www.flickr.com/photos/abc123/44445/',
        width:1200,height:900 },
      { creator:'Third',license:'by',license_version:'4.0',
        url:'https://untrusted.example/unknown.jpg',
        foreign_landing_url:'https://untrusted.example/photos/1',
        width:1200,height:900 },
      { creator:'',license:'by',license_version:'4.0',
        url:'https://live.staticflickr.com/1234/55555_abcd_c.jpg',
        foreign_landing_url:'https://www.flickr.com/photos/abc123/55555/',
        width:1200,height:900 },
      { creator:'Small',license:'by',license_version:'4.0',
        url:'https://live.staticflickr.com/1234/55555_abcd_c.jpg',
        foreign_landing_url:'https://www.flickr.com/photos/abc123/55555/',
        width:100,height:100 },
    ]});
  };
  const candidates=await searchOpenverseImageCandidates({
    subject:'Koi',province:'Sơn La',fetcher,limit:4,
  });
  assert.equal(candidates.length,2);
  assert.deepEqual(candidates.map(x=>x.license),['CC BY 4.0','CC BY-SA 3.0']);
  assert.ok(candidates.every(x=>x.sourceKind==='openverse'&&x.sourceUrl.startsWith('https://')));
  assert.equal((await searchOpenverseImageCandidates({subject:'',province:'Sơn La',fetcher})).length,0);
});
