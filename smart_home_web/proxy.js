const fs = require("fs");
const http = require("http");
const url = require("url");

const host = "0.0.0.0";
const port = process.env.PORT || "3000";
const __token__ = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCMDZYdnnPKfuqbo6bPH";

let remote_host = "";
let remote_port = 8091;

const error_ = (req, res, err_text) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({
        error: err_text
    }));
};

const requestListener = async (c_req, c_res) => {
    let urls = url.parse(c_req.url, true);

    try {
        if (urls.pathname == "/set") {
            let token = urls.query["token"];
            let ip = urls.query["ip"];
            let port = urls.query["port"];

            if (!token || !ip || !port) {
                return error_(c_req, c_res, "ip:port or token malfunction");
            }

            if (token != __token__) {
                return error_(c_req, c_res, "token malfunction");
            }

            remote_host = ip;
            remote_port = port;

            console.log(ip, port);
        }

        let options = {
            host: remote_host,
            port: remote_port,
            path: c_req.url,
            method: c_req.method,
            headers: c_req.headers,
        };

        let proxy = http.request(options, async (p_res) => {
            c_res.writeHead(p_res.statusCode, p_res.headers);
            p_res.pipe(c_res, {
                end: true
            });
        });

        c_req.pipe(proxy, {
            end: true
        });
    } catch (e) {
        return error_(req, res, "cannot setup");
    }

    console.log(
        `${c_req.socket.remoteAddress}:${c_req.socket.remotePort} -> ${c_req.method} '${c_req.url}'`
    );
    //return x;
};

(main = async () => {
    try {
        const server = http.createServer(requestListener);
        server.listen(port, host, () => {
            console.log(`Server is running on http://${host}:${port}`);
        });
    } catch (e) {
        console.log("error occured\n", e);
        setTimeout(() => main(), 1000);
    }
})();