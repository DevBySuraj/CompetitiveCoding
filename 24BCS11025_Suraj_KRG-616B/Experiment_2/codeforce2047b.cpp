#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int t;
    cin >> t;
    while (t--) {
        int n;
        cin >> n;
        string s;   
        cin >> s;

        vector<int> freq(26, 0);
        for (char c : s) freq[c - 'a']++;

        int mx = 0;
        char mx_char = s[0];
        for (int i = 0; i < 26; i++) {
            if (freq[i] > mx) {
                mx = freq[i];
                mx_char = char('a' + i);
            }
        }

        for (int i = 0; i < n; i++) {
            if (s[i] != mx_char) {
                s[i] = mx_char;
                break;
            }
        }

        cout << s << "\n";
    }

    return 0;
}
