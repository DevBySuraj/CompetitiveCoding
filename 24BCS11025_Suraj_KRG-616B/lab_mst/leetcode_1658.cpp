class Solution {
public:
    int minOperations(vector<int>& nums, int x) {

        int n = nums.size();

        int totalSum = 0;
        for (int num : nums) {
            totalSum += num;
        }

        int target = totalSum - x;

        if (target < 0)
            return -1;

        int left = 0;
        int currentSum = 0;
        int longestSubarray = -1;

        for (int right = 0; right < n; right++) {

            currentSum += nums[right];

            while (currentSum > target) {
                currentSum -= nums[left];
                left++;
            }

            if (currentSum == target) {
                longestSubarray = max(longestSubarray, right - left + 1);
            }
        }

        if (longestSubarray == -1)
            return -1;

        return n - longestSubarray;
    }
};
