export function errorHandler(err, req, res, next) {
  console.log("error:", err);
  res.status(err.status || 500).send({ message: err.message || "Something went wrong" });
}
