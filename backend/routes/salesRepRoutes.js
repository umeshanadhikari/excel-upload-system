const express = require('express');
const router = express.Router();
const poolPromise = require('../config/db'); // Database connection

// Get all sales representatives
router.get('/sales-reps', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(
      `SELECT DISTINCT [SalesRep] as name, [ID_SalesRep] as id 
       FROM [SlaesRecords] 
       WHERE [SalesRep] IS NOT NULL 
       ORDER BY [SalesRep]`
    );
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching sales reps:", err);
    res.status(500).json({ message: "Error fetching sales reps", error: err.message });
  }
});

module.exports = router;