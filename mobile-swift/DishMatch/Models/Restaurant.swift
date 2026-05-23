import Foundation

struct Restaurant: Codable, Identifiable {
    let id: UUID
    let googlePlaceId: String
    let name: String
    let cuisineTags: [String]
    let priceTier: String?
    let rating: Double?
    let photoUrl: String?
    let address: String?
    let lat: Double
    let lng: Double
    let description: String?
    let reviews: [String]?
    let vibeBlurb: String?
    let overallVibeQuotes: [String]?
}

struct VibePick: Codable {
    let restaurant: Restaurant
    let narrative: String
}

struct PersonalizedFit: Codable {
    let dietaryMatch: Bool
    let budgetMatch: Bool
    let cuisineOverlap: [String]
    let narrative: String
}

struct PersonalizedFitContext: Identifiable {
    let id: UUID
    let restaurantName: String
    let fit: PersonalizedFit
}

struct SessionResult: Codable, Identifiable {
    let restaurant: Restaurant
    let scorePct: Double
    let yesCount: Int
    let total: Int

    var id: UUID { restaurant.id }
}
