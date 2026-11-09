const dashboardMessage = document.getElementById("dashboardMessage");
const refreshDashboard = document.getElementById("refreshDashboard");
const summaryCards = document.getElementById("summaryCards");
const statusBreakdown = document.getElementById("statusBreakdown");
const activityChart = document.getElementById("activityChart");
const historyFilter = document.getElementById("historyFilter");
const historyMessage = document.getElementById("historyMessage");
const historyList = document.getElementById("historyList");

const statuses = ["Applied", "Under Review", "Selected for Interview", "Offer Extended", "Application Rejected"];

let allApplications = [];

async function loadDashboard() {
    refreshDashboard.disabled = true;
    dashboardMessage.textContent = "Dashboard Loading........";


    try {
        const [stats, applications] = await Promise.all([
            apiRequest("/api/dashboard"),
            apiRequest("/api/applications") //re-used for history list
        ]);


        allApplications = applications;
        dashboardMessage.textContent = "";

        renderSummary(stats.summary);
        renderStatusBreakdown(stats.byStatus);
        renderActivity(stats.byWeek);
        renderHistory();
    }
    catch(error) {
        dashboardMessage.textContent = error.message;
    }
    finally{ //executed regardless of outcome
        refreshDashboard.disabled = false;
    }

}

function renderSummary(summary){}

function renderStatusBreakdown(byStatus){}

function renderActivity(byWeek){}

function renderHistory(){}

refreshDashboard.addEventListener("click", loadDashboard);

loadDashboard();