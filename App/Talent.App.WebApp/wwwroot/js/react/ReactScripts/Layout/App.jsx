import React from 'react';
import HomePage from './HomePage.jsx';
import TalentFeed from '../TalentFeed/TalentFeed.jsx'
import EmployerFeed from '../EmployerFeed/EmployerFeed.jsx'
import TalentWatchlist from '../Watchlist/TalentWatchlist.jsx'
import TalentMatching from '../TalentMatching/TalentMatching.jsx'
import ManageJob from "../Employer/ManageJob/ManageJob.jsx"
import EmployerProfile from "../Profile/EmployerProfile.jsx"
import TalentProfile from "../Profile/AccountProfile.jsx"
import AccountSetting from "../Account/UserAccountSetting.jsx"
import CreateJob from "../Employer/CreateJob/CreateJob.jsx"
import TalentDetail from "../TalentFeed/TalentDetail.jsx";
import EmailConfirmation from "../UserSettings/EmailConfirmation.jsx";
import ResetPassword from "../Account/ResetPassword.jsx";
import VerifyClient from "../Account/VerifyClient.jsx";
import ManageClient from "../Recruiter/ManageClients/ManageClient.jsx";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

export default class App extends React.Component {
    render() {
        return (
            <Router>
                <div className="root">
                    <Routes>
                        <Route path="/" element={<Navigate to="/Home" />} />
                        <Route path="/Feed" element={<TalentFeed />} />
                        <Route path="/EmployerFeed" element={<EmployerFeed />} />
                        <Route path="/Watchlist" element={<TalentWatchlist />} />
                        <Route path="/EmployerProfile" element={<EmployerProfile />} />
                        <Route path="/TalentProfile" element={<TalentProfile />} />
                        <Route path="/TalentDetail" element={<TalentDetail />} />
                        <Route path="/TalentMatching" element={<TalentMatching />} />
                        <Route path="/AccountSettings" element={<AccountSetting />} />
                        <Route path="/ManageJobs" element={<ManageJob />} />
                        <Route path="/PostJob/:copyId?" element={<CreateJob />} />
                        <Route path="/ManageClient" element={<ManageClient />} />
                        <Route path="/Home" element={<HomePage />} />
                        <Route path="/VerifyEmail" element={<EmailConfirmation />} />
                        <Route path="/EditJob/:id" element={<CreateJob />} />
                        <Route path="/ResetPassword/:o/:p" element={<ResetPassword />} />
                        <Route path="/NewClient/:recruiterEmail/:clientEmail/:resetPasswordToken" element={<VerifyClient />} />
                        {/* Add a fallback route for 404 */}
                        <Route path="*" element={<div>Page not found</div>} />
                    </Routes>
                </div>
            </Router>
        )
    }
}
