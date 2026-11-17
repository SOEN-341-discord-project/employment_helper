const dashboardMessage = document.getElementById("dashboardMessage");
const refreshDashboard = document.getElementById("refreshDashboard");
const summaryCards = document.getElementById("summaryCards");
const statusBreakdown = document.getElementById("statusBreakdown");
const activityChart = document.getElementById("activityChart");
const historyFilter = document.getElementById("historyFilter");
const historyMessage = document.getElementById("historyMessage");
const historyList = document.getElementById("historyList");

const statuses = ["Applied", "Under Review", "Interview", "Offered", "Rejected"];

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

function renderSummary(summary){
    const cards = [
        ["Total applications", summary.total],
        ["In progress", summary.pending],
        ["Interviews", summary.interviews],
        ["Offers", summary.offers]
    ];

    summaryCards.replaceChildren();

    for (const [label, value] of cards) {
        const card = document.createElement("article");
        card.className = "stat-card";

        card.append(
            makeText("p", label, "stat-label"),
            makeText("p", String(value), "stat-value")
        );

        summaryCards.appendChild(card);
    }
}

function renderStatusBreakdown(byStatus){
    statusBreakdown.replaceChildren();

    const total = statuses.reduce(
        (sum, status) => sum + (byStatus[status] || 0),
        0
    );

    if (total === 0 ) {
        statusBreakdown.appendChild(
            makeText("p", "Apply to a job to see your status breakdown.", "empty-state")
        );
        return;
    }

    for (const status of statuses) {
        const count = byStatus[status] || 0;
        const row = document.createElement("div");
        row.className = "status-row";

        const label = document.createElement("div");
        label.className = "status-row-labels";
        label.append(
            makeText("span", status),
            makeText("span", String(count))
        );
        
        const track = document.createElement("div");
        track.className = "bar-track";

        const fill = document.createElement("span");
        fill.className = "bar-fill";
        fill.style.width = `${(count / total) * 100}%`;

        track.appendChild(fill);
        row.append(label, track);
        statusBreakdown.appendChild(row);
    }
}

function renderActivity(byWeek){
    activityChart.replaceChildren();

    if(byWeek.length ===0) {
        activityChart.appendChild(
            makeText("p", "Your weekly activity will appear here", "empty-state")
        );
        return;
    }

    const weeks = byWeek.slice(-8);
    const maxCount = Math.max(...weeks.map(item => item.count), 1);
    const chart = document.createElement("div");
    chart.className = "activity-bars";

    for (const item of weeks){ 
        const column = document.createElement("div");
        column.className = "activity-column";

        const bar = document.createElement("span");
        bar.className = "activity-bar";
        bar.style.height = `${(item.count / maxCount) * 100}%`;
        bar.title = `${item.count} applications`;

        const date = new Date(`${item.week}T00:00:00`).toLocaleDateString(
            undefined,
            { month: "short", day: "numeric" }
        );

        column.append(
            makeText("span", String(item.count), "activity-count"),
            bar,
            makeText("span", date, "activity-date")
        );

        chart.appendChild(column);
    }
        activityChart.appendChild(chart);
}

function renderHistory(){
    historyList.replaceChildren();

    const selectedStatus = historyFilter.value;
    const applications = allApplications.filter(
        application => !selectedStatus || application.status === selectedStatus
    );

    if (applications.length === 0 ) {
        historyMessage.textContent = allApplications.length
        ? "No applications match"
        : "No applications yet. Appy first";
        return;
    }

    historyMessage.textContent = `${applications.length} application(s)`;

    for (const application of applications) {
        const job = application.jobs || {};
        const card = document.createElement("article");
        card.className = "history-item";

        const details = document.createElement("div");
        details.append(
            makeText("h2", job.title || "Job application"),
            makeText(
                "p",
                [job.company, job.location].filter(Boolean).join(" · "),
                "muted small"
            )
        );

        const badge = makeText("span", application.status, "status-badge");
        badge.dataset.status = application.status;

        card.append(
            details,
            badge,
            makeText("p", `Applied ${showDate(application.created_at)}`, "muted small")
        );
        historyList.appendChild(card);
    }
}

refreshDashboard.addEventListener("click", loadDashboard);

loadDashboard();