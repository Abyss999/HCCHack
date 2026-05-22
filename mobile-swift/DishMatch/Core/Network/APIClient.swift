import Foundation

@MainActor
final class APIClient {
    static let shared = APIClient()

    private let session = URLSession.shared

    private static var decoder: JSONDecoder {
        let d = JSONDecoder()
        d.dateDecodingStrategy = .iso8601
        d.keyDecodingStrategy = .convertFromSnakeCase
        return d
    }

    private static var encoder: JSONEncoder {
        let e = JSONEncoder()
        e.keyEncodingStrategy = .convertToSnakeCase
        return e
    }

    func get<T: Decodable>(_ path: String, token: String? = nil) async throws -> T {
        try await request(method: "GET", path: path, body: nil as _Empty?, token: token)
    }

    func post<Body: Encodable, T: Decodable>(_ path: String, body: Body, token: String? = nil) async throws -> T {
        try await request(method: "POST", path: path, body: body, token: token)
    }

    func put<Body: Encodable, T: Decodable>(_ path: String, body: Body, token: String? = nil) async throws -> T {
        try await request(method: "PUT", path: path, body: body, token: token)
    }

    private func request<Body: Encodable, T: Decodable>(
        method: String,
        path: String,
        body: Body?,
        token: String?
    ) async throws -> T {
        let url = path.hasPrefix("http")
            ? URL(string: path)!
            : Config.apiBaseURL.appendingPathComponent(path)

        var req = URLRequest(url: url)
        req.httpMethod = method
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token { req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization") }
        if let body { req.httpBody = try APIClient.encoder.encode(body) }

        let (data, response) = try await session.data(for: req)
        guard let http = response as? HTTPURLResponse else { throw APIError.invalidResponse }

        switch http.statusCode {
        case 200...299:
            return try APIClient.decoder.decode(T.self, from: data)
        case 401:
            throw APIError.unauthorized
        case 404:
            throw APIError.notFound
        default:
            let msg = (try? JSONDecoder().decode(_ErrorBody.self, from: data))?.detail
                      ?? "HTTP \(http.statusCode)"
            throw APIError.serverError(msg)
        }
    }
}

private struct _Empty: Encodable {}
private struct _ErrorBody: Decodable { let detail: String }
