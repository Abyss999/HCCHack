import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authStore: AuthStore
    @EnvironmentObject var themeStore: ThemeStore
    @Environment(\.colorScheme) var systemScheme
    var theme: AppTheme { AppTheme.current(for: themeStore.resolved(system: systemScheme)) }

    @StateObject private var vm = ProfileViewModel()
    @State private var showSaveConfirm = false

    private let dietaryOptions  = ["Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "Nut-free"]
    private let cuisineOptions  = ["Italian", "Asian", "Mexican", "Indian", "Mediterranean", "American"]
    private let budgetOptions   = ["$", "$$", "$$$", "$$$$"]
    private let distanceOptions: [(label: String, km: Double)] = [
        ("1 mi", 1.6), ("5 mi", 8), ("10 mi", 16), ("25 mi", 40)
    ]

    var body: some View {
        NavigationStack {
            ZStack {
                theme.bg.ignoresSafeArea()
                ScrollView {
                    VStack(spacing: 24) {
                        // User info
                        if let user = authStore.user {
                            VStack(spacing: 8) {
                                AvatarView(name: user.name, userId: user.id, size: 64)
                                Text(user.name)
                                    .font(.system(size: 20, weight: .bold))
                                    .foregroundColor(theme.text)
                                Text(user.email)
                                    .font(.system(size: 14))
                                    .foregroundColor(theme.textSecondary)
                            }
                            .padding(.top, 24)
                        }

                        // Dietary restrictions
                        preferenceSection(title: "Dietary Restrictions") {
                            wrapFlow(items: dietaryOptions) { item in
                                ChipView(
                                    label: item,
                                    isSelected: vm.dietaryRestrictions.contains(item)
                                ) {
                                    vm.toggle(item, in: &vm.dietaryRestrictions)
                                }
                            }
                        }

                        // Cuisine preferences
                        preferenceSection(title: "Cuisine Preferences") {
                            wrapFlow(items: cuisineOptions) { item in
                                ChipView(
                                    label: item,
                                    isSelected: vm.cuisinePreferences.contains(item)
                                ) {
                                    vm.toggle(item, in: &vm.cuisinePreferences)
                                }
                            }
                        }

                        // Budget
                        preferenceSection(title: "Budget Range") {
                            HStack(spacing: 8) {
                                ForEach(budgetOptions, id: \.self) { b in
                                    ChipView(label: b, isSelected: vm.budgetRange == b) {
                                        vm.budgetRange = b
                                    }
                                }
                            }
                        }

                        // Distance
                        preferenceSection(title: "Max Distance") {
                            HStack(spacing: 8) {
                                ForEach(distanceOptions, id: \.km) { opt in
                                    ChipView(label: opt.label, isSelected: vm.maxDistanceKm == opt.km) {
                                        vm.maxDistanceKm = opt.km
                                    }
                                }
                            }
                        }

                        // Theme
                        preferenceSection(title: "Appearance") {
                            HStack(spacing: 8) {
                                ForEach(ThemeStore.Mode.allCases, id: \.self) { mode in
                                    ChipView(label: mode.rawValue.capitalized, isSelected: themeStore.mode == mode) {
                                        themeStore.setMode(mode)
                                    }
                                }
                            }
                        }

                        // Save button
                        PrimaryButton(title: "Save Preferences", isLoading: vm.isSaving) {
                            Task { await vm.savePreferences() }
                        }
                        .padding(.horizontal, 24)

                        // Logout
                        PrimaryButton(title: "Log Out", variant: .ghost) {
                            authStore.logout()
                        }
                        .padding(.horizontal, 24)
                        .padding(.bottom, 40)
                    }
                    .padding(.horizontal, 20)
                }
            }
            .navigationTitle("Profile")
            .navigationBarTitleDisplayMode(.inline)
        }
        .onChange(of: vm.saveSuccess) { success in
            if success { showSaveConfirm = true; vm.saveSuccess = false }
        }
        .alert("Saved!", isPresented: $showSaveConfirm) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("Your preferences have been updated.")
        }
    }

    @ViewBuilder
    private func preferenceSection<Content: View>(title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title)
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(theme.text)
            content()
        }
        .padding(16)
        .background(theme.surface)
        .cornerRadius(12)
    }

    @ViewBuilder
    private func wrapFlow(items: [String], @ViewBuilder chip: @escaping (String) -> some View) -> some View {
        let columns = [GridItem(.adaptive(minimum: 100), spacing: 8)]
        LazyVGrid(columns: columns, alignment: .leading, spacing: 8) {
            ForEach(items, id: \.self) { item in
                chip(item)
            }
        }
    }
}
