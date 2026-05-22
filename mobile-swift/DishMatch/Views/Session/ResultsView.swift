import SwiftUI

struct ResultsView: View {
    let sessionId: UUID

    @EnvironmentObject var sessionVM: SessionViewModel
    @EnvironmentObject var themeStore: ThemeStore
    @Environment(\.colorScheme) var systemScheme
    var theme: AppTheme { AppTheme.current(for: themeStore.resolved(system: systemScheme)) }

    @StateObject private var vm: ResultsViewModel
    @Environment(\.dismiss) var dismiss

    init(sessionId: UUID) {
        self.sessionId = sessionId
        self._vm = StateObject(wrappedValue: ResultsViewModel(
            sessionId: sessionId,
            sessionVM: SessionViewModel()
        ))
    }

    private let medals = ["🥇", "🥈", "🥉"]

    var body: some View {
        ZStack {
            theme.bg.ignoresSafeArea()
            ScrollView {
                VStack(spacing: 24) {
                    VStack(spacing: 8) {
                        Text("Results")
                            .font(.system(size: 28, weight: .black))
                            .foregroundColor(theme.text)
                        Text("Your group's top picks")
                            .font(.system(size: 14))
                            .foregroundColor(theme.textSecondary)
                    }
                    .padding(.top, 32)

                    if vm.isLoading {
                        ProgressView().tint(theme.primary).padding(40)
                    } else if vm.results.isEmpty {
                        Text("No results yet. Keep swiping!")
                            .foregroundColor(theme.textSecondary)
                            .padding(40)
                    } else {
                        ForEach(Array(vm.results.enumerated()), id: \.element.id) { idx, result in
                            resultRow(result: result, medal: idx < medals.count ? medals[idx] : "#\(idx+1)")
                        }
                    }

                    PrimaryButton(title: "Start New Session", variant: .secondary) {
                        dismiss()
                    }
                    .padding(.horizontal, 24)
                    .padding(.bottom, 40)
                }
                .padding(.horizontal, 20)
            }
        }
        .navigationBarHidden(true)
        .task { await vm.load() }
    }

    @ViewBuilder
    private func resultRow(result: SessionResult, medal: String) -> some View {
        HStack(spacing: 14) {
            Text(medal)
                .font(.system(size: 28))
                .frame(width: 40)

            VStack(alignment: .leading, spacing: 4) {
                Text(result.restaurant.name)
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(theme.text)
                if let address = result.restaurant.address {
                    Text(address)
                        .font(.system(size: 12))
                        .foregroundColor(theme.textSecondary)
                        .lineLimit(1)
                }
                HStack(spacing: 6) {
                    ForEach(result.restaurant.cuisineTags.prefix(2), id: \.self) { tag in
                        Text(tag)
                            .font(.system(size: 11))
                            .foregroundColor(theme.primary)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(theme.chipBg)
                            .clipShape(Capsule())
                    }
                }
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 2) {
                Text("\(Int(result.scorePct * 100))%")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(theme.primary)
                Text("\(result.yesCount)/\(result.total)")
                    .font(.system(size: 12))
                    .foregroundColor(theme.textSecondary)
            }
        }
        .padding(16)
        .background(theme.surface)
        .cornerRadius(14)
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(theme.cardBorder, lineWidth: 1)
        )
    }
}
