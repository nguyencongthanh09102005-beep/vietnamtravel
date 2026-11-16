/** One Vercel Hobby function for existing API routes. No auth bypass: each
 * handler retains its server-side authentication and rate limiting. */
import route0 from '../server/api/admin.js';
import route1 from '../server/api/admin/worker.js';
import route2 from '../server/api/administration/aliases.js';
import route3 from '../server/api/administration/check.js';
import route4 from '../server/api/ai.js';
import route5 from '../server/api/auth/login.js';
import route6 from '../server/api/auth/logout.js';
import route7 from '../server/api/auth/me.js';
import route8 from '../server/api/auth/profile.js';
import route9 from '../server/api/auth/recover.js';
import route10 from '../server/api/auth/register.js';
import route11 from '../server/api/auth/reset-password.js';
import route12 from '../server/api/content.js';
import route13 from '../server/api/content/refresh.js';
import route14 from '../server/api/content/review.js';
import route15 from '../server/api/itineraries.js';
import route16 from '../server/api/itineraries/generate.js';
import route17 from '../server/api/itineraries/locations.js';
import route18 from '../server/api/user-data.js';

const handlers:Record<string,{fetch:(r:Request)=>Promise<Response>}>={
  'admin':route0,
  'admin/worker':route1,
  'administration/aliases':route2,
  'administration/check':route3,
  'ai':route4,
  'auth/login':route5,
  'auth/logout':route6,
  'auth/me':route7,
  'auth/profile':route8,
  'auth/recover':route9,
  'auth/register':route10,
  'auth/reset-password':route11,
  'content':route12,
  'content/refresh':route13,
  'content/review':route14,
  'itineraries':route15,
  'itineraries/generate':route16,
  'itineraries/locations':route17,
  'user-data':route18,
};

export default {
  async fetch(request:Request):Promise<Response> {
    const original=new URL(request.url);
    let route=original.searchParams.get('__route') || original.pathname.replace(/^\/api\//,'');
    try {route=decodeURIComponent(route);}catch{return Response.json({error:'Invalid API route'}, {status:400});}
    if(route.length>100||!/^[a-z0-9/-]+$/.test(route)||route.includes('//')||
       !Object.prototype.hasOwnProperty.call(handlers,route)){
      return Response.json({error:'API endpoint not found'},{status:404});
    }
    // Do not forward routing metadata or silently change client-supplied queries.
    original.searchParams.delete('__route');
    original.pathname='/api/'+route;
    return handlers[route].fetch(new Request(original.toString(),request));
  },
};
