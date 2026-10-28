// Wraps handlers: converts MySQL integrity/trigger errors into clean 400 messages.
const CLIENT_ERRNOS = [1048, 1062, 1406, 1451, 1452, 1644, 3819];
export const handle = (fn) => async (req, ctx) => {
  try { return await fn(req, ctx); }
  catch (e) {
    console.error(e);
    if (CLIENT_ERRNOS.includes(e.errno)) return Response.json({ error: e.sqlMessage || e.message }, { status: 400 });
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
};
