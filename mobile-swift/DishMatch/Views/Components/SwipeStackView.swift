import SwiftUI

struct SwipeStackView: View {
    let restaurants: [Restaurant]
    let onSwipe: (Restaurant, SwipeDirection) async -> Void
    let onStackEmpty: () -> Void

    @EnvironmentObject var themeStore: ThemeStore
    @Environment(\.colorScheme) var systemScheme
    var theme: AppTheme { AppTheme.current(for: themeStore.resolved(system: systemScheme)) }

    @State private var swipedCount = 0

    var body: some View {
        let remaining = Array(restaurants.dropFirst(swipedCount))
        if remaining.isEmpty {
            emptyState
        } else {
            ZStack {
                // Background peek card
                if remaining.count > 1 {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(theme.surface)
                        .overlay(
                            RoundedRectangle(cornerRadius: 16)
                                .stroke(theme.cardBorder, lineWidth: 1)
                        )
                        .frame(height: 520)
                        .scaleEffect(0.96)
                        .offset(y: 10)
                        .zIndex(0)
                }

                // Top card
                RestaurantCardView(
                    restaurant: remaining[0],
                    onSwipeLeft: {
                        Task { await onSwipe(remaining[0], .no) }
                        advance()
                    },
                    onSwipeRight: {
                        Task { await onSwipe(remaining[0], .yes) }
                        advance()
                    }
                )
                .zIndex(1)
            }
        }
    }

    private func advance() {
        swipedCount += 1
        if swipedCount >= restaurants.count { onStackEmpty() }
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 48))
                .foregroundColor(theme.primary)
            Text("You've seen all restaurants!")
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(theme.text)
            Text("Wait for your group or view results.")
                .font(.system(size: 14))
                .foregroundColor(theme.textSecondary)
        }
        .padding(40)
    }
}
