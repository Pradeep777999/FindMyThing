const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

// Configure transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Helper to send emails via transporter
async function sendEmail(to, subject, html) {
  try {
    console.log(`\n==================================================\n[EMAIL SIMULATION] To: ${to}\nSubject: ${subject}\nHTML Content:\n${html}\n==================================================\n`);
    await transporter.sendMail({
      from: `"FindMyThing" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
  } catch (err) {
    console.error("Email error:", err);
  }
}

// Helper to determine the current lost and found catalog cycle
function getCurrentCycle() {
  const now = new Date();
  const year = now.getFullYear();

  const jan27 = new Date(year, 0, 27);
  const aug15 = new Date(year, 7, 15);

  if (now >= jan27 && now < aug15) {
    return "CYCLE_1";
  } else {
    return "CYCLE_2";
  }
}

// Helper to parse student batch, branch, and department from email addresses
function parseUserEmail(email) {
  if (!email) return { department: "N/A", branch: "N/A", year: "N/A" };
  const match = email.match(/^(\d{2})691A(\d{2})[A-Z0-9]{2}@mits\.ac\.in$/i);
  if (match) {
    const yearDigits = parseInt(match[1]);
    const branchCode = match[2];
    const admissionYear = 2000 + yearDigits;
    const currentYear = 2026;
    let diff = currentYear - admissionYear;
    diff += 1;
    
    let yearName = "N/A";
    if (diff === 1) yearName = "1st Year";
    else if (diff === 2) yearName = "2nd Year";
    else if (diff === 3) yearName = "3rd Year";
    else if (diff === 4) yearName = "4th Year";
    else if (diff > 4) yearName = "Alumni";

    let branchName = "N/A";
    let deptName = "N/A";
    const branchMap = {
      "05": { dept: "CSE", branch: "Computer Science" },
      "04": { dept: "ECE", branch: "Electronics" },
      "03": { dept: "ME", branch: "Mechanical" },
      "02": { dept: "EEE", branch: "Electrical" },
      "01": { dept: "CE", branch: "Civil" },
      "28": { dept: "CST", branch: "Computer Science & Technology" },
      "32": { dept: "CSE-DS", branch: "Data Science" },
      "31": { dept: "CSE-AI", branch: "Artificial Intelligence" }
    };

    if (branchMap[branchCode]) {
      deptName = branchMap[branchCode].dept;
      branchName = branchMap[branchCode].branch;
    }

    return { department: deptName, branch: branchName, year: yearName };
  }
  if (email.endsWith("@mits.ac.in")) {
    return { department: "Administration", branch: "Staff", year: "N/A" };
  }
  return { department: "External", branch: "N/A", year: "N/A" };
}

// Database startup backfill migration
async function runStartupMigration() {
  try {
    const Item = mongoose.model("Item");
    const Collected = mongoose.model("Collected");
    
    const itemsToUpdate = await Item.find({ type: "found", department: { $exists: false } });
    for (const item of itemsToUpdate) {
      if (item.userEmail) {
        const details = parseUserEmail(item.userEmail);
        await Item.updateOne(
          { _id: item._id },
          { $set: { department: details.department, branch: details.branch, year: details.year } }
        );
      }
    }

    const collectedsToUpdate = await Collected.find({ type: "found", department: { $exists: false } });
    for (const coll of collectedsToUpdate) {
      if (coll.userEmail) {
        const details = parseUserEmail(coll.userEmail);
        await Collected.updateOne(
          { _id: coll._id },
          { $set: { department: details.department, branch: details.branch, year: details.year } }
        );
      }
    }

    const collectedsMissingDate = await Collected.find({ type: "found", dateFound: { $exists: false } });
    for (const coll of collectedsMissingDate) {
      const dateStr = coll.collectedAt ? new Date(coll.collectedAt).toISOString().split('T')[0] : "2025-08-15";
      await Collected.updateOne(
        { _id: coll._id },
        { $set: { dateFound: dateStr } }
      );
    }
    
    if (itemsToUpdate.length > 0 || collectedsToUpdate.length > 0 || collectedsMissingDate.length > 0) {
      console.log(`[Migration] Ran database backfill (active items, collected items, and dates).`);
    }
  } catch (err) {
    console.error("[Migration] Error during startup migration:", err);
  }
}

module.exports = {
  sendEmail,
  getCurrentCycle,
  parseUserEmail,
  runStartupMigration
};
