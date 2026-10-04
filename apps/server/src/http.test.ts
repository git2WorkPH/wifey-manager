import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {once} from 'node:events';
import {createBudgetServer} from './http';
import {LedgerStore} from './store';
test('HTTP API denies unauthorized access and round-trips authenticated mutations',async()=>{
  const store=new LedgerStore(':memory:');
  const token=randomUUID();const server=createBudgetServer(store,token);
  server.listen(0,'127.0.0.1');await once(server,'listening');
  const address=server.address();assert.ok(address&&typeof address!=='string');
  const url=`http://127.0.0.1:${address.port}`;
  const headers={Authorization:`Bearer ${token}`,'Content-Type':'application/json'};
  try{
    assert.equal((await fetch(url+'/records')).status,401);
    assert.equal((await fetch(url+'/records',{headers:{Authorization:'Bearer incorrect'}})).status,401);
    const mutation={operationId:randomUUID(),record:{id:randomUUID(),revision:0,kind:'category',name:'Rent',archived:false}};
    const result=await fetch(url+'/mutations',{method:'POST',headers,body:JSON.stringify(mutation)});assert.equal(result.status,200);
    const body=await result.json();assert.equal(body.record.revision,1);
    const retry=await fetch(url+'/mutations',{method:'POST',headers,body:JSON.stringify(mutation)});assert.deepEqual(await retry.json(),body);
    const stale=await fetch(url+'/mutations',{method:'POST',headers,body:JSON.stringify({...mutation,operationId:randomUUID()})});assert.equal(stale.status,409);
    const rows=await fetch(url+'/records',{headers});assert.equal((await rows.json()).length,1);
    const invalid=await fetch(url+'/mutations',{method:'POST',headers,body:'{}'});assert.equal(invalid.status,400);
  }finally{server.closeAllConnections();await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));store.close();}
});
