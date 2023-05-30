const minify = require('pg-minify');
const validator = require('validator');

const { conn } = require('../utils/dbConnection');
const customHeader = require('../utils/customHeader');

// get pool urls
const getUrl = async (req, res) => {
  const query = minify(
    `
    SELECT
        config_id,
        url
    FROM
        config
    `,
    { compress: true }
  );

  const response = await conn.query(query);

  if (!response) {
    return new AppError(`Couldn't get data`, 404);
  }

  const out = {};
  for (const e of response) {
    out[e.config_id] = e.url;
  }
  res.set(customHeader()).status(200).json(out);
};

// get unique pool values
// (used during adapter testing to check if a pool field is already in the DB)
const getDistinctID = async (req, res) => {
  const query = minify(
    `
    SELECT
        DISTINCT(pool),
        config_id,
        project
    FROM
        config
    `,
    { compress: true }
  );

  const response = await conn.query(query);

  if (!response) {
    return new AppError(`Couldn't get data`, 404);
  }

  res.status(200).json(response);
};

// get config data of pool
const getConfigPool = async (req, res) => {
  const configIDs = req.params.configIDs;
  const query = minify(
    `
    SELECT
      *
    FROM
        config
    WHERE
        config_id IN ($<configIDs:csv>)
    `,
    { compress: true }
  );

  const response = await conn.query(query, {
    configIDs: configIDs.split(','),
  });

  if (!response) {
    return new AppError(`Couldn't get data`, 404);
  }

  res.set(customHeader()).status(200).json({
    status: 'success',
    data: response,
  });
};

module.exports = {
  getUrl,
  getDistinctID,
  getConfigPool,
};
