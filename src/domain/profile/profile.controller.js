const { fn, col, Op } = require('sequelize');
const { applyDateRangeValidation } = require('../@utils/common.validator');
const { PROFILE_TYPE } = require('./profile.enum');

class ProfileController {
  #profileModel;
  #contractModel;
  #jobModel;

  constructor({ profileModel, contractModel, jobModel }) {
    this.#profileModel = profileModel;
    this.#contractModel = contractModel;
    this.#jobModel = jobModel;
  }

  async findById({ id }) {
    try {
      return await this.#profileModel.findOne({ where: { id } });
    } catch (error) {
      console.error(JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw new Error(`Error getting profile by id=${id}`);
    }
  }

  async updateBalanceById({ id, valueToAdd }) {
    try {
      return await this.#profileModel.increment({ balance: valueToAdd }, { where: { id } });
    } catch (error) {
      console.error(JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw new Error(`Error updating profile=${id} balance=+${valueToAdd}`);
    }
  }

  async getProfessionByEarningDesc({ start, end, raw = false }) {
    const validatedParams = applyDateRangeValidation({ start, end });
    try {
      return await this.#profileModel.findAll({
        raw,
        where: { type: PROFILE_TYPE.CONTRACTOR },
        attributes: ['profession', [fn('SUM', col('Contractor.Jobs.price')), 'earnings']],
        include: [
          {
            model: this.#contractModel,
            as: 'Contractor',
            attributes: [],
            include: [
              {
                model: this.#jobModel,
                as: 'Jobs',
                attributes: [],
                where: {
                  paid: true,
                  paymentDate: {
                    [Op.between]: [
                      new Date(`${validatedParams.start}T00:00:00Z`),
                      new Date(`${validatedParams.end}T23:59:59Z`)
                    ]
                  }
                }
              }
            ]
          }
        ],
        group: ['profession'],
        order: [[col('earnings'), 'DESC']]
      });
    } catch (error) {
      console.error(JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw new Error(`Error getting the profession that earned the most money by time range=${start}-${end}`);
    }
  }

  async getClientsThatPaidTheMostWithRangeAndLimit({ start, end, limit = 2, raw = false }) {
    const validatedParams = applyDateRangeValidation({ start, end });
    try {
      // Worked with this as a raw DB query due to not being able to perform this 'limit' directly from Sequelize Model.
      // Would love to know if there's a better/cleaner solution to this. :)
      // PS: Left the code down there (ln 101-131) just to keep it for review as well, so that you know where I got stuck.
      const startDate = `${validatedParams.start} 00:00:00.000 +00:00`;
      const endDate = `${validatedParams.end} 23:59:59.000 +00:00`;
      const query = `
        SELECT 
            Profile.id,
            Profile.firstName || ' ' || Profile.lastName AS fullName,
            SUM(Job.price) AS paid
        FROM 
            Profiles AS Profile
        INNER JOIN 
            Contracts AS Contract ON Profile.id = Contract.ClientId
        INNER JOIN 
            Jobs AS Job ON Contract.id = Job.ContractId
        WHERE 
            Profile.type = '${PROFILE_TYPE.CLIENT}'
            AND Job.paid = ${+true}
            AND Job.paymentDate BETWEEN '${startDate}' AND '${endDate}'
        GROUP BY 
            Profile.id
        ORDER BY 
            paid DESC
        LIMIT ${limit};
      `;
      // return await this.#profileModel.findAll({
      //   raw,
      //   limit,
      //   where: { type: PROFILE_TYPE.CLIENT },
      //   attributes: ['id', [fn('SUM', col('Client.Jobs.price')), 'paid']],
      //   include: [
      //     {
      //       as: 'Client',
      //       model: this.#contractModel,
      //       attributes: [],
      //       include: [
      //         {
      //           as: 'Jobs',
      //           model: this.#jobModel,
      //           attributes: [],
      //           where: {
      //             paid: true,
      //             paymentDate: {
      //               [Op.between]: [
      //                 new Date(`${validatedParams.start}T00:00:00Z`),
      //                 new Date(`${validatedParams.end}T23:59:59Z`)
      //               ]
      //             }
      //           }
      //         }
      //       ]
      //     }
      //   ],
      //   group: ['Profile.id'],
      //   order: [[col('paid'), 'DESC']]
      // });
      const [results] = await this.#profileModel.sequelize.query(query);
      return results;
    } catch (error) {
      console.error(JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw new Error(
        `Error getting the client that paid the most money by time range=${start}-${end} and limit=${limit}`
      );
    }
  }
}

module.exports = ProfileController;
