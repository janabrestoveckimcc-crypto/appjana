import test from 'node:test';
import assert from 'node:assert/strict';
import {documentHash,isDuplicateDocument} from '../document-fingerprint.mjs';

test('SHA-256 matches a known value and is independent of filename and MIME label',async()=>{
 const original=new File(['abc'],'document.pdf',{type:'application/pdf'});
 const renamed=new File(['abc'],'renamed.txt',{type:'text/plain'});
 const hash=await documentHash(original);
 assert.equal(hash,'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
 assert.equal(await documentHash(renamed),hash);
 assert.ok(isDuplicateDocument({fileHash:hash},[{fileHash:await documentHash(renamed)}]));
});
test('same filename with different content is not a duplicate',async()=>{
 const a=await documentHash(new File(['one'],'same.pdf'));
 const b=await documentHash(new File(['two'],'same.pdf'));
 assert.equal(isDuplicateDocument({fileHash:a},[{fileHash:b}]),false);
});
test('normalized content detects older records and downloaded/reuploaded images',()=>{
 assert.ok(isDuplicateDocument({fileHash:'original',contentHash:'jpeg'},[{contentHash:'jpeg'}]));
 assert.ok(isDuplicateDocument({fileHash:'jpeg',contentHash:'reencoded'},[{fileHash:'original',contentHash:'jpeg'}]));
});
test('missing hashes never match; empty collection accepts a first upload',()=>{
 assert.equal(isDuplicateDocument({},[{}]),false);
 assert.equal(isDuplicateDocument({fileHash:'a'},[]),false);
});
test('same batch detects a second identical file against the newly saved record',async()=>{
 const documents=[];
 const candidate={fileHash:await documentHash(new Blob(['%PDF-1.4 test']))};
 assert.equal(isDuplicateDocument(candidate,documents),false);
 documents.push(candidate);
 assert.equal(isDuplicateDocument(candidate,documents),true);
});
