import SwiftUI

struct CodeDisplayView: View {
    let code: String

    @EnvironmentObject var themeStore: ThemeStore
    @Environment(\.colorScheme) var systemScheme
    var theme: AppTheme { AppTheme.current(for: themeStore.resolved(system: systemScheme)) }

    @State private var copied = false

    var body: some View {
        VStack(spacing: 12) {
            HStack(spacing: 10) {
                ForEach(Array(code.uppercased().enumerated()), id: \.offset) { _, char in
                    ZStack {
                        RoundedRectangle(cornerRadius: 10)
                            .fill(theme.surface)
                            .overlay(
                                RoundedRectangle(cornerRadius: 10)
                                    .stroke(theme.primary.opacity(0.4), lineWidth: 1.5)
                            )
                            .frame(width: 60, height: 72)
                        Text(String(char))
                            .font(.system(size: 32, weight: .bold, design: .monospaced))
                            .foregroundColor(theme.primary)
                    }
                }
            }

            HStack(spacing: 16) {
                Button {
                    UIPasteboard.general.string = code.uppercased()
                    copied = true
                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) { copied = false }
                } label: {
                    Label(copied ? "Copied!" : "Copy Code", systemImage: copied ? "checkmark" : "doc.on.doc")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(theme.primary)
                }

                ShareLink(item: "Join my DishMatch session! Code: \(code.uppercased())") {
                    Label("Share", systemImage: "square.and.arrow.up")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(theme.textSecondary)
                }
            }
        }
    }
}
