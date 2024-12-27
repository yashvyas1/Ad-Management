import React, { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import PrivateRoute from "./services/PrivateRoute";
import Layout from "./layout/Layout";
import LoaderCircle from "@/components/Loader-circle";
import Payment from "./modules/admin/Payment";
import Support from "./pages/supportpage/Support";
import FAQs from "./pages/supportpage/FAQs";
import WrittenGuide from "./pages/supportpage/WrittenGuide";
import Tutorials from "./pages/supportpage/Tutorials";
import PublisherSetting from "./modules/publisher/settings/Setting";
import PublisherPayments from "./modules/publisher/PublisherPayments";
import PublisherUsers from "./modules/publisher/PublisherUsers";
import PublisherWebsiteAnalytics from "./modules/publisher/PublisherWebsiteAnalytics";
import PublisherBankDetails from "./modules/publisher/PublisherBankDetails";
import PublisherInvoice from "./modules/publisher/PublisherInvoice";
import FeedbackForm from "./modules/advertiser/FeedbackForm";
import AdminAdAnalytics from "./modules/admin/AdminAdAnalytics";
import AdminUsers from "./modules/admin/AdminUsers";
import AdminReports from "./modules/admin/AdminReports";
import AdminFeedback from "./modules/admin/AdminFeedback";
import AdminSetting from "./modules/admin/settings/Setting";
import AdvertiserSetting from "./modules/advertiser/settings/Setting";


// Lazy-loaded components
const Home = lazy(() => import("./pages/homepage/Home"));
const Signin = lazy(() => import("./pages/signin/SignIn"));
const Register = lazy(() => import("./pages/signup/Register"));
const PrivacyPolicy = lazy(() => import("./pages/homepage/PrivacyPolicy"));
const Error = lazy(() => import("./pages/404"));
const AdminDashboard = lazy(() => import("./modules/admin/AdminDashboard"));
const AdsList = lazy(() => import("./modules/admin/AdsList"));
const AdvertiserDashboard = lazy(() => import("./modules/advertiser/AdvertiserDashboard"));
const CreateAd = lazy(() => import("./modules/advertiser/CreateAd"));
const Advertisement = lazy(() => import("./modules/advertiser/Advertisement"));
const PublisherDashboard = lazy(() => import("./modules/publisher/PublisherDashboard"));
const PublisherWebsiteList = lazy(() => import("./modules/publisher/PublisherWebsiteList"));
const AdvertiserPayments = lazy(() => import("./components/advertiser/table/AdvertiserPayments"));
const AdvertisementUsers = lazy(() => import("./components/advertiser/table/AdvertiserUsers"));
const AdvertiserMedia = lazy(() => import("./modules/advertiser/AdvertiserMedia"));
const CategoryList = lazy(() => import("../src/modules/admin/CategoryList"));

function App() {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      window.history.pushState(null, null, window.location.href);
      window.onpopstate = function () {
        window.history.go(1);
      };
    }
  }, []);

  return (
    <main>
      <Suspense
        fallback={
          <div>
            {" "}
            <LoaderCircle />
          </div>
        }
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Signin />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/admin/login" element={<Signin />} />
          <Route path="/publisher/bankdetails" element={<PublisherBankDetails />} />
          <Route path="/publisher/invoice" element={<PublisherInvoice />} />
          <Route path="*" element={<Error />} />

          {/* Protected Routes */}
          <Route path="/*" element={<Layout />}>
            {/* Admin Routes */}
            <Route
              path="admin/dashboard"
              element={
                <PrivateRoute element={<AdminDashboard />} role="admin" />
              }
            />
            <Route
              path="admin/ads-list"
              element={<PrivateRoute element={<AdsList />} role="admin" />}
            />
            <Route
              path="admin/category-list"
              element={<PrivateRoute element={<CategoryList />} role="admin" />}
            />
            <Route
              path="admin/ad-analytics"
              element={<PrivateRoute element={<AdminAdAnalytics />} role="admin" />}
            />
            <Route
              path="admin/users-table"
              element={<PrivateRoute element={<AdminUsers />} role="admin" />}
            />
            <Route
              path="admin/payments"
              element={<PrivateRoute element={<Payment />} role="admin" />}
            />
            <Route
              path="admin/reports"
              element={<PrivateRoute element={<AdminReports />} role="admin" />}
            />
            <Route
              path="admin/feedback"
              element={
                <PrivateRoute element={<AdminFeedback />} role="admin" />
              }
            />
            <Route
              path="admin/setting"
              element={
                <PrivateRoute element={<AdminSetting />} role="admin" />
              }
            />

            {/* Advertiser Routes */}
            <Route
              path="advertiser/dashboard"
              element={
                <PrivateRoute
                  element={<AdvertiserDashboard />}
                  role="advertiser"
                />
              }
            />
            <Route
              path="advertiser/ads-list"
              element={
                <PrivateRoute element={<CreateAd />} role="advertiser" />
              }
            />
            <Route
              path="advertiser/advertisement"
              element={
                <PrivateRoute element={<Advertisement />} role="advertiser" />
              }
            />
            <Route
              path="advertiser/support"
              element={<PrivateRoute element={<Support />} role="advertiser" />}
            />
            <Route
              path="advertiser/tutorials"
              element={
                <PrivateRoute element={<Tutorials />} role="advertiser" />
              }
            />
            <Route
              path="advertiser/written-guide"
              element={
                <PrivateRoute element={<WrittenGuide />} role="advertiser" />
              }
            />
            <Route
              path="advertiser/faq"
              element={<PrivateRoute element={<FAQs />} role="advertiser" />}
            />
            <Route
              path="advertiser/setting"
              element={
                <PrivateRoute
                  element={<AdvertiserSetting />}
                  role="advertiser"
                />
              }
            />
            <Route
              path="advertiser/feedback"
              element={
                <PrivateRoute element={<FeedbackForm />} role="advertiser" />
              }
            />
            <Route
              path="advertiser/users"
              element={<PrivateRoute element={<AdvertisementUsers />} role="advertiser" />}
            />
            <Route
              path="advertiser/payments"
              element={
                <PrivateRoute element={<AdvertiserPayments />} role="advertiser" />
              }
            />
            <Route
              path="advertiser/media"
              element={
                <PrivateRoute element={<AdvertiserMedia />} role="advertiser" />
              }
            />

            {/* Publisher Routes */}
            <Route
              path="publisher/dashboard"
              element={
                <PrivateRoute
                  element={<PublisherDashboard />}
                  role="publisher"
                />
              }
            />
            <Route
              path="publisher/website-details"
              element={
                <PrivateRoute
                  element={<PublisherWebsiteList />}
                  role="publisher"
                />
              }
            />
            <Route
              path="publisher/website-analytics"
              element={
                <PrivateRoute
                  element={<PublisherWebsiteAnalytics />}
                  role="publisher"
                />
              }
            />
            <Route
              path="publisher/users"
              element={
                <PrivateRoute element={<PublisherUsers />} role="publisher" />
              }
            />
            <Route
              path="publisher/payments"
              element={
                <PrivateRoute
                  element={<PublisherPayments />}
                  role="publisher"
                />
              }
            />
            <Route
              path="publisher/setting"
              element={
                <PrivateRoute element={<PublisherSetting />} role="publisher" />
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </main>
  );
}

export default App;
