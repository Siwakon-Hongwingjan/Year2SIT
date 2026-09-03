// 1. Router Layer (HTTP/Uniform Interface Concern)
import * as service from "./services/subject-service.js";

export async function handleUserRequest(request, response) {
  const { method } = request;
  const url = request.url.split("?")[0];
  if (url === "/subjects") {
    switch (method) {
      case "GET": {
        const subjects = await service.getAllSubjects();
        return writeResponse(response, 200, subjects);
      }
      case "POST":
        return createSubject(request, response);
      default:
        return writeResponse(response, 405, { error: "Method not allowed" });
    }
  }

  if (url.startsWith("/subjects/")) {
    const id = url.slice("/subjects/".length).replace(/\/$/, "");
    switch (method) {
      case "GET": {
        const subject = await service.getSubjectById(id);
        return writeResponse(
          response,
          subject ? 200 : 404,
          subject ?? { error: "Subject not found for id = " + id },
        );
      }
      case "PUT":
        return updateSubject(request, response, id);
      case "DELETE": {
        const ok = await service.removeSubjectById(id);
        if (ok) {
          response.writeHead(204);
          return response.end();
        }
        return writeResponse(response, 404, {
          error: "Subject not found for id = " + id,
        });
      }
      default:
        return writeResponse(response, 405, { error: "Method not allowed" });
    }
  }

  return writeResponse(response, 404, { error: "Resource not found" });
}

function getBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk.toString();
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : null);
      } catch (err) {
        reject(err);
      }
    });
    request.on("error", reject);
  });
}

function writeResponse(response, status, message) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(message));
}

async function createSubject(request, response) {
  let subject;
  try {
    subject = await getBody(request);
  } catch {
    return writeResponse(response, 400, { error: "Invalid JSON body" });
  }
  if (!subject) {
    return writeResponse(response, 400, {
      error: "Bad request, body is empty",
    });
  }
  const newSubject = await service.createNewSubject(subject);
  if (!newSubject) {
    return writeResponse(response, 409, {
      error: `Duplicate subject for id ${subject.id}`,
    });
  }
  return writeResponse(response, 201, newSubject);
}

async function updateSubject(request, response, id) {
  let subject;
  try {
    subject = await getBody(request);
  } catch {
    return writeResponse(response, 400, { error: "Invalid JSON body" });
  }
  if (!subject) {
    return writeResponse(response, 400, {
      error: "Bad request, body is empty",
    });
  }
  const updated = await service.updateSubjectById(id, subject);
  if (!updated) {
    return writeResponse(response, 404, {
      error: `Subject not found for id ${id}`,
    });
  }
  return writeResponse(response, 200, updated);
}
