const STATUSES = ["Applied", "Under Review", "Interview", "Offered", "Rejected"];

function countByStatus(applications) {
    const counts = {};

    for (const status of STATUSES) {
        counts[status] = 0;
    }

    for (const application of applications) {
        if (STATUSES.includes(application.status)) {
            counts[application.status] = counts[application.status] + 1;
        }
    }

    return counts;
}

function weekStart(dateText) {
    const date = new Date(dateText);

    date.setUTCDate(date.getUTCDate() - date.getUTCDay());

    return date.toISOString().slice(0, 10);
}

function countByWeek(applications) {
    const counts = {}; 

    for (const application of applications) {
        const week = weekStart(application.created_at);

        if (counts[week] === undefined) {
            counts[week] = 0;
        }
        counts[week] = counts[week] + 1;
    }

    const sortedWeeks = Object.keys(counts).sort();

    const result = [];
    for (const week of sortedWeeks) {
        result.push({ week: week, count: counts[week] });
    }

    return result;
}

function summarize(applications) {
    const counts = countByStatus(applications);

    return {
        total: applications.length,
        pending: counts["Applied"] + counts["Under Review"],
        interviews: counts["Interview"],
        offers: counts["Offered"],
        rejected: counts["Rejected"]
    };
}

module.exports = { STATUSES, countByStatus, countByWeek, summarize };