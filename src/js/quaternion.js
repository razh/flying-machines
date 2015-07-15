export default {
  applyVector3( q, v ) {
    q.x +=  v.x * q.w + v.y * q.z - v.z * q.y;
    q.y +=  v.y * q.w + v.z * q.x - v.x * q.z;
    q.z +=  v.z * q.w + v.x * q.y - v.y * q.x;
    q.w += -v.x * q.x - v.y * q.y - v.z * q.z;
    return q;
  }
};
