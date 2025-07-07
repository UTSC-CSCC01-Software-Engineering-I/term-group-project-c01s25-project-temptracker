# Release Plan

**Release Name:** `<Release-v2.0>`

---

## Release Objectives

Detail the primary goals for the sprint N release. Each objective should be Specific, Measurable, Achievable, Relevant, and Time-bound (SMART).

For the second release of TempTracker’s GLOW, we want to build and fully release a temperature uploading feature by the end of Sprint 2 (July 7th, 2025). We want 100% of this functionality to be finished by this date, so both admins and users can start filling our PostgreSQL database. This is a core function of the app, and we would use these points to both populate the main map and the user profile dashboards, showing users their submissions.

The second primary goal is to implement the map feature with over 1000 mock points to visualize and test its functionality. This initial implementation of the map should also be finished by the end of Sprint 2. The map functionality should use data interpolation combined with a heatmap to display temperatures, and have an interactive slider to view the temperatures across different points of time.

---

## Specific Goals

- Create an about/landing page that includes the product description, is appealing, accessible, and contains mission/incentive statements describing the software  
- Create an interactive map that uses colour-coded displays to showcase temperature data, including extra utilities such as unit conversion, time sliders, and accessibility shortcuts  
- Connect the previously created temperature upload frontend to the Supabase backend with PostgreSQL, allowing users to upload and view their submitted data  
- Finish user authentication and login-related services. Add OAuth, prompt users for a username, and create a profile section that displays user data.  

---

## Metrics for Measurement

### About/landing page

- About page should have an inclined row-view containing 3+ rows of information. This would include a row of eye-catching statistics, a mission statement, and info on how to use the software

### Interactive Map

- The map should be able to display 1000 points initially and interpolate the space in between with relevant coloured data.

### Upload Temperature

- Temperature upload should have a 100% success rate regardless of single data input our large CSV data. Two types of accounts (users + admins) should be able to upload data with numerous fields (Time, Date, Temperature, Location, etc) and view it on a separate page/dashboard.

### User Authentication

- User authentication with Supabase Auth should be seamless nad have a close to 0% error rate. Sign-in providers (Ex: Google with OAuth) should also follow a similar metric with a 0% error rate and no 400-, 500- error codes.  

---

## Release Scope

The v2.0 release of the GLOW app should fulfill the primary goals outlined above, with some changes in implementation and construction.

### Included Features

- **Upload Temperature Form**  
  The form is now connected with the backend and supports single-point data and larger CSV imports from admins  
  The form schema was also revised to include a timestamp along with date  

- **User Profile and Dashboard**  
  Once signed in, users can navigate to the profiles tab to view their account information and a list of their temperature submissions  
  Admin accounts are able to look at all data submitted on the app  

- **Improved Navigation**  
  The navigation links are now separated into universal and account-specific links  
  A new button hides links (login, logout, profile) that aren’t intended for non-signed-in users  

- **New User Tables**  
  Combining data from Supabase Auth and custom user profiles, GLOW has increased data, including a new username field that can be used to log in  
  The system will also record your provider (Google, GitHub, email)  

- **Data Interpolation Map**  
  Map ‘fills in’ missing data using data interpolation and a heat map  
  The map also displays a legend and some utilities  

### Excluded Features

- **Timeline/Archive Map View**  
  Adding a slider to the map involves numerous utilities that will not be included in this release. This includes caching queried data by time, data filtering, and updating displays on quick component shifts  

- **Gamification**  
  Gamification ideas will be discussed (sharing pictures, leaderboards, streaks, points system, trivia), but will be postponed to a future iteration due to time constraints  

- **Ideas for extension (including air quality, weather)**  
  These ideas are not part of the MVP, and will be judged based on time constraints and the progress of future iterations  

### Bug Fixes

- Will update Supabase policies to allow users to read data from the temperature table (previous queries resulted in 0 rows returned)  
- Fix errors with changing system theme (dark/light modes) using TailwindV4  

---

## Non-Functional Requirements

Detail any performance, security, or usability requirements.  
Ensure these are measurable and testable.

### Performance

- All pages should load under 2 seconds  
- Our map with 1000 data points needs to load and efficiently be able to tell the temperature in the lake area  
- Temperature uploads (including bulk CSV) have to be uploaded and reflected in the map data in <2 seconds  

### Security

- All data uploads need to be locked behind authentication to allow accurate data  
- Furthermore, admins need to verify this data  
- RLS Policies ensure that only admins can see all user tables while users are restricted to their own data  
- Non-authenticated users should have limited access to the website, and should not be able to change anything  

### Usability

- The entire map for temptracker should be useable and scaled down for mobile screen sizes  
- All icons and buttons are optimized for web based mobile access  
- Users should be able to get information of the app from the about page  

---

## Dependencies and Limitations

Outline any external dependencies that might affect the release.  
Identify any known limitations of the current release

- The site isn't hosted yet, so we can’t test it on an actual mobile device (although we can still use browser tools)  
- Some things are not fully optimized for mobile (like admin page)  
- Our map only has specific points as the date interpolation algorithms/heatmaps have not been fully integrated/tested. Thus you can only see clusters of points  

---

## Detailed Instruction - Steps to Carry Out the Deployment

- We would ensure all changes are merged to the main branch in GitHub  
- Make sure all .env variables are properly hidden (included in the readme)  
- Test the app locally before deployment, then carry out local deployment using nodeJS  

---

## PIV (Post Implementation Verification) Instruction

- We can test with and without using an admin account to ensure that authentication and user input are working correctly.  
- Ensure load testing for the map and ensure small latency for adding millions of points.  
- Check Supabase to ensure all data is being written properly  
- Ensure rendered points are appearing on the map  
- Test login/registration flow, including sign-in, register, logout, OAuth to ensure that session is working properly and protecting certain pages  

---

## Post-Deployment Monitoring

- Monitor Supabase for any read/write errors  
- Set up alerts whenever the build fails  
- Have a feedback form on the app that lets users submit feedback to us  

---

## Roll Back Strategy

- Revert to a previous build on main and try to hotfix the current build to fix the issue  
- Use PostgreSQL data backups in case of dropped tables  
- Make sure to notify users that the app is down.  
