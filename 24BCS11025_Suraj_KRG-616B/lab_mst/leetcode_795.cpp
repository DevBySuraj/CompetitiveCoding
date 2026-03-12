class Solution {
public:
    int numSubarrayBoundedMax(vector<int>& nums, int left, int right) {
        int n = nums.size();
        int i =0;
        int j =0;
        int m= 0;
        int count = 0;
        while(j<n){
            if(nums[j] > right){
                m =0;
                i = j+1;
            }
            else if(nums[j]  >=left && nums[j] <= right){
                m = j-i+1;
                count += m;
            }
            else if(nums[j] < left){
                count +=m;
            }

            j++;
        }
        return count;
    }
};
