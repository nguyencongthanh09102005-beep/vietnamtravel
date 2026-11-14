import assert from 'node:assert/strict';
import { test } from 'node:test';

const { travelServiceLinks, travelDestinationLabel, canOfferTravelServices } = await import('../.api-test-dist/src/utils/travel-affiliate.js');

test('unconfigured travel service links are not mislabeled as affiliate',()=>{
  const services=travelServiceLinks('Đà Nẵng');
  assert.equal(services.length,4);
  assert.deepEqual(services.map(service=>service.id),['booking','traveloka','klook','vexere']);
  assert.ok(services.every(service=>service.url.startsWith('https://')));
  assert.ok(services.every(service=>service.partnerConfigured===false));
  assert.ok(services[0].url.includes(encodeURIComponent('Đà Nẵng')));
});

test('approved HTTPS affiliate templates can substitute encoded destinations',()=>{
  const links=travelServiceLinks('Cần Thơ',{booking:'https://partner.example/book?city={destination}'});
  assert.equal(links[0].partnerConfigured,true);
  assert.equal(new URL(links[0].url).searchParams.get('city'),'Cần Thơ');
  assert.ok(links.slice(1).every(service=>!service.partnerConfigured));
});

test('unsafe or malformed affiliate URLs always fall back to normal links',()=>{
  for(const invalid of ['http://partner.example/','javascript:alert(1)','https://localhost/','https://user:secret@partner.example/','xxx']){
    const service=travelServiceLinks('Hà Nội',{booking:invalid})[0];
    assert.equal(service.partnerConfigured,false);
    assert.ok(service.url.startsWith('https://www.booking.com/'));
  }
});

test('province-specific service links and labels are honest about destination',()=>{
  assert.equal(travelDestinationLabel('TP. Hà Nội'), 'Hà Nội');
  assert.equal(travelDestinationLabel('Tỉnh Đồng Tháp'), 'Đồng Tháp');
  const haNoi=travelServiceLinks('Hà Nội'), canTho=travelServiceLinks('TP. Cần Thơ');
  assert.match(haNoi.find(x=>x.id==='traveloka').caption,/Hà Nội/);
  assert.match(canTho.find(x=>x.id==='vexere').caption,/Cần Thơ/);
  assert.match(decodeURIComponent(canTho[0].url),/Cần Thơ/);
  assert.ok(!canTho.find(x=>x.id==='traveloka').destinationPrefilled);
  assert.ok(haNoi.find(x=>x.id==='klook').destinationPrefilled);
  assert.ok(!canTho.find(x=>x.id==='klook').destinationPrefilled);
  assert.equal(canOfferTravelServices('Ha Noi'),true);
  assert.equal(canOfferTravelServices('Hoang Sa'),false);
  assert.equal(canOfferTravelServices('Truong Sa'),false);
});
