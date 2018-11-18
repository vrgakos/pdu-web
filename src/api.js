import axios from 'axios'

const APIv1 = '/api/v1';
const CONFIG = {
    crossDomain: true,
    headers: {
//        'Access-Control-Allow-Origin': '*',
        'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlLXN5c3RlbSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJuYW1lc3BhY2UtY29udHJvbGxlci10b2tlbi1rbGQ2eCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50Lm5hbWUiOiJuYW1lc3BhY2UtY29udHJvbGxlciIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50LnVpZCI6IjIzNWYwNmVlLTJjNGQtMTFlOC05NTQxLTAwNTA1NjhmNzYwNSIsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDprdWJlLXN5c3RlbTpuYW1lc3BhY2UtY29udHJvbGxlciJ9.uP_5dmMOek7-_CKAkXYi0TNezNH56AXGpjVI7wy-SoQ_wDu8JIWRPjz570nYI1T64mPdVe8RdCiCGjwlK_qG_qG_kFw1Kk3w2sRZnCfjj3TAJ-zHppBkDheicA7ugZBKBkUmLN3b1qf8rmnIDv50GaIho2eYe7hJRtVslvK-_PQjzLKdfZNnRJBz80KyAzu5Jo5umRcE0J8nTN_jP-KdxCHmByJRW6HhqZCslaBzAwihpIgYOeiWZa9Sy0YP7W7WD7LQj_X27om19dEIBUwas9pGs5YkD0lZd_jiY3erA3MXzoEUYBnKUgO49m809pFITNbSNFJMabpN2h7mDgz-Mg'
    }
};

const PodAPI = {
    getAll: async () => {
        let res = await axios.get(APIv1 + '/pods', CONFIG);
        return res.data.items
    },

    getOne: async (namespace, name) => {
        let res = await axios.get(APIv1 + '/namespaces/' + namespace + '/pods/' + name, CONFIG);
        return res.data
    }
};

export default PodAPI