export default (fastify) => async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader) throw new Error("No authorization header");
  
      const token = authHeader.split(" ")[1];
      request.user = fastify.jwt.verify(token, { algorithms: ['RS256'] });
  
      // console.log("🔐 Verified Token:", request.user);
    } catch (err) {
      console.error("❌ JWT Verification Error:", err.message);
      reply.code(401).send({ error: "Unauthorized" });
    }
  };
  