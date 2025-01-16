const fs = require('fs');
const path = require('path');

// Function to generate a templated changelog from the JSON file
function generateChangelogText(jsonFilePath) {
    try {
        // Read the JSON file
        const changelogData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

        // Extract data from JSON
        const {
            baseBranch,
            currentBranch,
            totalCommits,
            totalPRs,
            totalFilesChanged,
            timeSinceFirstChange,
            timeSinceLastChange,
            totalContributors,
            uniqueContributors,
            changelog,
            version
        } = changelogData;

        // Template: Header Section
        
        let changelogText = `Changelog: ${baseBranch} -> ${currentBranch}

Summary:
- Version: ${version["major"]}.${version["minor"]}.${version["patch"]}
- Total Commits: ${totalCommits}
- Total PRs: ${totalPRs}
- Total Files Changed: ${totalFilesChanged}
- Time Since First Change: ${timeSinceFirstChange}
- Time Since Last Change: ${timeSinceLastChange}
- Total Contributors: ${totalContributors}

---

Commits and PRs:
`;

        // Template: Commits and PRs Section
        changelog.forEach((entry) => {
            const cleanedMessage = entry.message.replace(/\r/g, "");
            if (!entry.pr) {
                changelogText += `
    Commit SHA: ${entry.sha}
    Date: ${new Date(entry.date).toLocaleString()}
    User: ${entry.user}
    Message: ${cleanedMessage}
    ---
    `;
            } 
        });

        // Template: Contributors Section
        changelogText += `
Contributors:
`;

        uniqueContributors.forEach((contributor) => {
            changelogText += `- ${contributor.username}: ${contributor.contributions} contributions\r\n`;
        });

        // Export the text file
        const outputFilePathDetailed = path.join(__dirname, `changelog_${baseBranch}_to_${currentBranch}.txt`);
        const outputFilePathBase = path.join(__dirname, `changelog.txt`);
        fs.writeFileSync(outputFilePathDetailed, changelogText, 'utf-8');
        fs.writeFileSync(outputFilePathBase, changelogText, 'utf-8');
        console.log(`Changelog exported with detailed name to ${outputFilePathDetailed}`);
        console.log(`Changelog exported with base name to ${outputFilePathBase}`);
    } catch (error) {
        console.error(`Error processing the JSON file: ${error.message}`);
    }
}

// Main function to trigger the changelog generation
function main() {
    const args = process.argv.slice(2); // Get the command line arguments

    if (args.length === 0) {
        console.error('Error: Please provide the path to the JSON file as an argument.');
        process.exit(1); // Exit with an error code
    }

    const jsonFilePath = path.resolve(args[0]);

    // Check if the JSON file exists
    if (!fs.existsSync(jsonFilePath)) {
        console.error(`Error: The file '${jsonFilePath}' does not exist.`);
        process.exit(1); // Exit with an error code
    }

    // Generate the changelog from the provided JSON file
    generateChangelogText(jsonFilePath);
}

// Execute the main function
main();
