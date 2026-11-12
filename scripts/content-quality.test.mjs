import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluateContentTaxonomy, isSubjectExcluded, normalizedSubjectKey } from '../.api-test-dist/src/utils/contentQuality.js';
import { mergeVerifiedContent } from '../.api-test-dist/api/content.js';
import { provinceDetailsCatalog } from '../.api-test-dist/src/data/provinceDetailsData.js';

const verdict=(name,section,provinceId,description,categoryTitles,wikidataDescription)=>
  evaluateContentTaxonomy({name,section,provinceId,description,categoryTitles,wikidataDescription});

test('seven screenshot examples are excluded from the wrong tabs',()=>{
  // Lào Cai: people and performing arts are not edible.
  assert.equal(isSubjectExcluded('Người Dao','cuisine','Người Dao là dân tộc'),true);
  assert.equal(isSubjectExcluded('Đoàn Chèo Yên Bái','cuisine','Đoàn văn nghệ biểu diễn'),true);
  assert.equal(isSubjectExcluded('Bến Ninh Kiều','cuisine','Bến cảng tham quan Cần Thơ'),true);
  // Cần Thơ and Đồng Tháp: accidents are not places worth visiting.
  assert.equal(isSubjectExcluded('Sự cố sập nhịp dẫn cầu Cần Thơ','places','Sự cố giao thông'),true);
  assert.equal(isSubjectExcluded('Vụ trẻ em rơi vào cọc ống bê tông ở Đồng Tháp','places','Tai nạn'),true);
  // Quảng Trị: the former province Quảng Bình is NOT a destination.
  assert.equal(isSubjectExcluded('Quảng Bình (tỉnh)','places','Quảng Bình là một tỉnh cũ'),true);
  // Hải Phòng: a breed is not a prepared dish.
  assert.equal(isSubjectExcluded('Gà Liên Minh','cuisine','Gà Liên Minh là giống gà nội địa'),true);
  // Thanh Hóa: a municipality is not a food dish.
  assert.equal(isSubjectExcluded('Thanh Hóa (thành phố)','cuisine','Thành phố thuộc Thanh Hóa'),true);
});
test('strict topic check requires both article categories and Wikidata description',()=>{
  const food = verdict('Don Quảng Ngãi','cuisine','Quang Ngai',
    'Don là món ăn đặc sản của tỉnh Quảng Ngãi, thường được chế biến với nước dùng.',
    ['Thể loại:Ẩm thực Quảng Ngãi'],'món ăn đặc sản của Việt Nam');
  assert.equal(food.approved,true,food.reason);
  const travel = verdict('Bến Ninh Kiều','places','Can Tho',
    'Bến Ninh Kiều là điểm tham quan nổi tiếng ở Cần Thơ.',
    ['Thể loại:Địa điểm du lịch Cần Thơ'],'bến sông và điểm tham quan');
  assert.equal(travel.approved,true,travel.reason);
  assert.equal(verdict('Bến Ninh Kiều','cuisine','Can Tho',
    'Bến Ninh Kiều là điểm tham quan nổi tiếng ở Cần Thơ.',
    ['Thể loại:Địa điểm du lịch Cần Thơ'],'bến sông và điểm tham quan').approved,false);
  assert.equal(verdict('Quảng Bình (tỉnh)','places','Quang Tri',
    'Quảng Bình là tỉnh cũ của Việt Nam, nay sáp nhập với Quảng Trị.',
    ['Thể loại:Di tích lịch sử'],'di tích lịch sử').approved,false);
  assert.equal(verdict('Người Dao','cuisine','Lao Cai',
    'Người Dao là một dân tộc ở Lào Cai.',
    ['Thể loại:Ẩm thực người Dao'],'món ăn của Việt Nam').approved,false);
  assert.equal(verdict('Gà Liên Minh','cuisine','Hai Phong',
    'Gà Liên Minh là một giống gà ở Hải Phòng.',
    ['Thể loại:Ẩm thực Hải Phòng'],'món ăn Việt Nam').approved,false);
});
test('a generic dish cannot become a local specialty because a province is mentioned in the article body',()=>{
  const unrelated = verdict('Nem rán','cuisine','Thanh Hoa',
    'Nem rán hay chả giò là một món ăn quen thuộc tại Việt Nam. '.repeat(5) + 'Một số vùng gồm Thanh Hóa.',
    ['Thể loại:Ẩm thực Việt Nam'],'món ăn Việt Nam');
  assert.equal(unrelated.approved,false);
  assert.match(unrelated.reason,/tỉnh/);
});
test('same dish with regional or bracketed qualifiers produces one identity',()=>{
  assert.equal(normalizedSubjectKey('Don Quảng Ngãi','Quang Ngai'),normalizedSubjectKey('Don (món ăn)','Quang Ngai'));
  assert.equal(normalizedSubjectKey('Don Quảng Ngãi','Quang Ngai'),'don');
  assert.equal(normalizedSubjectKey('Nem chua Thanh Hóa','Thanh Hoa'),'nem chua');
});
test('legacy keyword-only auto version is hidden even when DB had marked it approved',()=>{
  const mistaken = {name:'Người Dao',description:'Người Dao tại Lào Cai',image:'https://example.org/image.jpg'};
  const before = provinceDetailsCatalog['Lao Cai'];
  const after = mergeVerifiedContent('Lao Cai',[{
    content_id:'wiki_junk',section:'cuisine',version_id:'auto_abcdef1234',
    payload_json:JSON.stringify(mistaken),
  }]);
  assert.deepEqual(after.data.cuisine,before.data.cuisine);
});
test('approved taxonomy v2 content deduplicates a dish already written manually',()=>{
  const entry = {name:'Don (món ăn)',description:'Món don tại Quảng Ngãi',image:'',
    wikidataId:'Q1234',sourceUrl:'https://vi.wikipedia.org/wiki/Don',
    taxonomyGateVersion:2};
  const a=mergeVerifiedContent('Quang Ngai',[{
    content_id:'wiki_don',section:'cuisine',version_id:'auto_v2_example',
    payload_json:JSON.stringify(entry),
  }]);
  assert.equal(a.data.cuisine.length,provinceDetailsCatalog['Quang Ngai'].data.cuisine.length);
  assert.ok(!a.data.cuisine.some(x=>x.name==='Don (món ăn)'));
});
