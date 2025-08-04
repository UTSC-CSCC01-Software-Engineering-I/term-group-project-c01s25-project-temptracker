**Release Plan**

### **Release Name:** \<Release-v4.0\>

### **Release Objectives**

Detail the primary goals for the sprint N release. Each objective should be Specific, Measurable, Achievable, Relevant, and Time-bound (SMART).

- For the fourth release of TempTracker’s GLOW, our primary goal is to finalize the map features and enhance the user experience through performance improvements. We want to deploy an interactive map with real time temperature data, location tracking, and analyzation features.  
- Our secondary goal is to finalize all the gamification features and improve the UI for our web application. This includes polishing the community leaderboard, completing the badge system and a photo sharing feature that allows users to interact with each other to make the platform more engaging and appealing to encourage more frequent user interactions and contribution.


#### **Specific Goals**

* Finalize and launch the interactive map with real time temperature data, unit conversions, as well as points on the map that can be selected to bring up an analysis window of trends based on user submitted data

* Complete the photo upload system with the ability to tag a point of interest as well as a like feature

* Implement a settings page which allows users to opt out of emails, as well as giving them an option to add a profile picture or delta account

* Complete unit testing

  * Ensure all frontend and backend functionalities for sprint 4 are covered, we want to aim between 70%-100% coverage for reliable unit testing

* Establish a CI/CD pipeline for automatic building and deployment on a virtual machine

  * Anyone can connect using the public vm ip

* Enable location based autofill

  * Automatically capture and use the users current gps coordinates during temperature uploads and POIs

#### **Metrics for Measurement**

* Map  
  * The map should be interactive and render within \<1000ms on both mobile and desktop  
  * Trend analysis should pop up within \<1000ms as well  
* Photo upload  
  * Photo uploads should be reflected in the UI in \<5s on both mobile and desktop devices  
  * Liking a photo should update state in \<2s  
* Settings  
  * Actions such as toggling email preferences, uploading profile pictures or account deletions should occur successfully under 2s  
* Unit testing  
  * Unit testing should achieve \>70% coverage of the core sprint 4 features  
* CI/CD  
  * The github actions deployment should occur within \<7 min to ensure quick updates  
* Location Services  
  * Gps autofill should occur in \<1s during uploads or site access, with appropriate fallback message if permission is denied

### **Release Scope**

The v4.0 release of the GLOW app should fulfill the primary goals outlined above, with some changes in implementation and construction. 

#### **Included Features**

* List all key features and improvements included in the release.  
* Provide a brief description and purpose of each.

* Community Page  
  * A central hub that showcases user photo uploads, a leaderboard of top contributors, and an ability to browse community members  
  * Helps users interact with each other while fostering competition to promote participation  
* Photo Gallery  
  * A display where users can upload photos tagged with the POI, while being able to view and like other users photos  
  * Builds a visual records of user contributions, while enhancing user interaction through likes  
* Settings  
  * A user account page to manage preferences like email notifications, profile pic updates and account delete  
  * Allows user to control their account data, since we are very user focused  
* Map (trend chart)  
  * We implemented an analyze trends feature that allows users to click a point on the map and analyze trends of data in the region  
  * This helps provide temperature trends for the lakes, to help in research based on lake data  
* Progress Email  
  * Sends a progress/ new feature email to all users that have notifications turned on  
  * Allows admins to update users on new bug fixes  
* Location Service  
  * User location gets saved and shows POI nearby, autofills when data is uploaded  
  * Simplifies user data upload by instantaneous location calculation  
* POI  
  * Shows list of popular lakes/beaches near the user location  
  * To allow data and images to be categorized based on POI, also helps users locate lakes near them

#### **Excluded Features**

* Ideas for extension (including air quality, weather)  
  * These ideas are not part of the MVP, and will not be implemented due to lack of time

#### **Bug Fixes**

* Updated next.config.js to dynamically get api url based on .env variables  
* Oauth login flow fixed, users are now allowed to add a unique username

#### 

#### ---

#### 

#### **Non-Functional Requirements**

* Detail any performance, security, or usability requirements.  
* Ensure these are measurable and testable.  
    
1. Performance:  
   1. All pages should load under 2 seconds  
   2. Our map should either render 500k points server-side or use some rasterization/tiling to limit computation on the browser,  
   3. Temperature uploads (including bulk CSV) have to be uploaded and reflected in the map data in \<2 seconds  
   4. Photo gallery should update in \<2s  
   5. CI/CD should fully deploy under 10 min, to ensure quick updates  
   6. POIs appear on the home page in \<5s  
2. Security:  
   1. All uploaded data (photos, temperatures) need to be rate-limited and verified for correctness.  
      1. Admins should have the ability to report this data  
   2. RLS Policies ensure that only admins can see all user tables while users are restricted to their own data  
   3. Block some pages of the website before creating an account. Ex: leaderboard and profile routes should be blocked by middleware until account creation.  
3. Useability  
   1. The entire webpage should be responsive regardless of device size  
   2. All icons and buttons are optimized for web-based mobile access  
   3. Users should be able to understand the different leaderboards and badges. This means having descriptive descriptions of how to achieve them and how they are measured.   
   4. Error handling should be human-readable and consistent across the ui

#### 

#### **Dependencies and Limitations**

* Outline any external dependencies that might affect the release.  
* Identify any known limitations of the current release

1. We are limited to backend hosting and photo uploads by technology. We don’t have access to large S3 buckets for AWS cloud storage, so must work with reasonable tools.  
2. We are not able to use location services on CI/CD deployment website because it is hosted on http, thus we have default location values that are used (Toronto)

In an Organizational setting, the Release Planning Document also has additional details. For Term Project, groups can ignore the below sections but give thoughts on how you would complete the below sections if you were responsible for filling them out.

* ### **Detailed Instruction \- Steps to Carry Out the Deployment**

- We would ensure all changes are merged to the main branch in GitHub.   
- With proper unit tests now, we will use GitHub actions to verify tests before pushing code to either the develop/main branch.   
- Make sure all .env variables are properly hidden (included in the readme)  
- Start both backend and frontend in their respective directories.  
    
    
    
* **PIV (Post Implementation Verification) Instruction**

We can test with and without using an admin account to ensure that authentication and user input are working correctly. 

- Ensure load testing for the map and ensure latency using the server-side map implementation.  
- Check Supabase to ensure al DB writes/reads are succeeding  
- Automate unit tests (create a script for this) to ensure app functions correctly  
- Ensure rendered points are appearing on the map  
- Test login/registration flow, including sign-in, register, logout, OAuth to ensure that session is working properly and protecting certain pages  
    
* **Post-Deployment Monitoring**  
- Monitor Supabase for any read/write errors  
- Set up alerts whenever the build fails  
- Have a feedback form on the app that lets users submit feedback to us  
    
* **Roll Back Strategy**  
- Revert to a previous build on main and try to hotfix the current build to fix the issue  
- Use PostgreSQL data backups in case of dropped tables  
- Make sure to notify users that the app is down  
  