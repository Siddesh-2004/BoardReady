import { ApiError } from "../utils/apiErrors.js";
import { getBoardByName } from "../services/board.service.js";

const extractSubdomain = (host) => {
    // e.g. "typingrace.boardready.com" -> "typingrace"
    // also handles "typingrace.localhost:3000" for local testing
    return host.split(".")[0].split(":")[0];
};

const subdomainMiddleware = async (req, res, next) => {
    try {
        const host = req.headers.host;  

        if (!host) {
            throw new ApiError(400, "Missing Host header");
        }

        const subdomain = extractSubdomain(host);

        const board = await getBoardByName(subdomain);

        if (!board) {
            throw new ApiError(404, `No board found for subdomain "${subdomain}"`);
        }

        req.board = board;
        next();
    } catch (err) {
        next(err);
    }
};

export { subdomainMiddleware };