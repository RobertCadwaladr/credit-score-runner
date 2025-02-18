import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { credit_score, user_usermodel } from './schema';
import { eq, sql } from 'drizzle-orm';
import FeatureGenerator from './featureGenerator';
import { InferenceSession, Tensor, } from "onnxruntime-node";
import { z } from 'zod';

//Get Env Variables
const envVars = z.object({
    MODEL_PATH_1: z.string(),
    MODEL_PATH_2: z.string(),
    MODEL_PATH_3: z.string(),
    MODEL_PATH_4: z.string(),
    MODEL_PATH_5: z.string()
});
const {
    MODEL_PATH_1,
    MODEL_PATH_2,
    MODEL_PATH_3,
    MODEL_PATH_4,
    MODEL_PATH_5
} = envVars.parse(process.env)

const models = [MODEL_PATH_1, MODEL_PATH_2, MODEL_PATH_3, MODEL_PATH_4, MODEL_PATH_5];

const userQueryClient = postgres(`postgres://postgres:rLWLzXaa1yWhb0GM3XPl@noggin-api-db-prod-001.c4ugcgst7s2o.eu-west-2.rds.amazonaws.com:5432/nogginprod`);
const userdb = drizzle(userQueryClient);

const transactionQueryClient = postgres(`postgresql://postgres:OUtosdD4hfTfI909QixH@noggin-tf-db-prod-001.c4ugcgst7s2o.eu-west-2.rds.amazonaws.com/tfdev`)
const transactiondb = drizzle(transactionQueryClient)

async function inferenceModel(allResults: { [key: string]: number[] }[], modelPath: string) {
    if (allResults.length === 0)
        return new Map() as Map<string, number[]>
    const creditScores: Map<string, number[]> = new Map()
    console.log('session tracker')
    const session = await InferenceSession.create(modelPath);
    const input_name = session.inputNames[0];

    console.log('session opened?')
    for (const result of allResults) {
        console.log('result tracker')
        const key = Object.keys(result)[0];

        if (result[key].length === 0) {
            if (!creditScores.has(key))
                creditScores.set(key, [])
    
            creditScores.get(key)?.push(0)

            continue
        }

        const inputShape = [1, result[key].length]
        console.log(inputShape)
        const tensor = new Tensor("float32", result[key], inputShape)
        console.log(tensor)
        const feeds = { [input_name]: tensor }
        console.log(feeds)

        let creditScore
        try {
            creditScore = await session.run(feeds)
        }
        catch (error) {
            console.log(error)
            creditScore = undefined
        }

        console.log(creditScore)

        if (!creditScores.has(key))
            creditScores.set(key, [])

        creditScores.get(key)?.push(creditScore ? creditScore.probabilities.data[1] as number : 0)

        console.log(creditScores)

    }
    return creditScores
}

export const handler = async (event: Event) => {

    const userDetails = await userdb.select({
        id: user_usermodel.id,
        user_external_id: user_usermodel.external_id
    })
        .from(user_usermodel)
        .orderBy(user_usermodel.id)
        .limit(100)

    const userList: string[] = []

    userDetails.map((details) => {
        userList.push(details.user_external_id)
    });

    // console.log(userList)

    const query = FeatureGenerator(userList);
        
    //     [
    //     '008decb1-30f5-403b-b598-32e8471d13ca',
    //     '052b9712-a601-40a8-aa3b-006b826f689d',
    //     '2c333cc6-ec88-4aed-9185-76c92c71631e',
    //     '5e4c792b-73c9-4004-90ed-1686ea3c4a58',
    //     '62362abc-7d46-4712-906d-20fa52668c5f',
    //     '65358277-d646-41cd-861c-78e3484ccd5f',
    //     'b05f6ae1-8c40-4f5c-9d19-402bf6508c62',
    //     'bc76cde6-7dc5-4a9b-8759-c602fcd02330',
    //     'c48d2699-2617-47e5-9a30-26998a38f8e8',
    //     'fadc1e59-9365-4fd6-8553-b4a7597dcbef'
    // ])

    const result = await transactiondb.execute(query)

    const allResults: { [key: string]: number[] }[] = []

    result.map(async (rawFeatures) => {
        const features: number[] = []

        features.push(rawFeatures.outlfow_to_inflow_ratio as number)
        features.push(rawFeatures.debt_to_inflow_ratio as number)
        features.push(rawFeatures.savings_to_inflow_ratio as number)
        features.push(rawFeatures.gambling_to_inflow_ratio as number)
        features.push(rawFeatures.avg_inflow as number)
        features.push(rawFeatures.regular_income_count as number)
        features.push(rawFeatures.debt_collection_repayment as number)
        features.push(rawFeatures.count_debt_collection_transaction as number)
        features.push(rawFeatures.bnpl_flag as number)
        features.push(rawFeatures.car_finance_flag as number)
        features.push(rawFeatures.credit_card_flag as number)
        features.push(rawFeatures.betting_flag as number)
        features.push(rawFeatures.lottery_flag as number)
        features.push(rawFeatures.casino_bingo_flag as number)
        features.push(rawFeatures.arranged_overdraft_flag as number)
        features.push(rawFeatures.mortgage_flag as number)
        features.push(rawFeatures.has_car_flag as number)
        features.push(rawFeatures.returned_payment_flag as number)
        features.push(rawFeatures.bnpl_transaction_count as number)
        features.push(rawFeatures.car_finance_count as number)
        features.push(rawFeatures.loan_repayment_count as number)
        features.push(rawFeatures.returned_payment_count as number)
        features.push(rawFeatures.total_loans as number)
        features.push(rawFeatures.total_debit_loans as number)
        features.push(rawFeatures.loan_coverage_ratio as number)
        features.push(rawFeatures.deposit_withdrawal_ratio as number)
        features.push(rawFeatures.avg_debt as number)
        features.push(rawFeatures.avg_cash_withdrawal as number)
        features.push(rawFeatures.avg_charitable_giving as number)
        features.push(rawFeatures.salary as number)
        features.push(rawFeatures.rent as number)
        features.push(rawFeatures.mortgage as number)
        features.push(rawFeatures.transaction_tenor as number)

        const tempResult: { [key: string]: number[] } = {}

        tempResult[rawFeatures.user_external_id as string] = features

        allResults.push(tempResult)
    })

    const creditScores: Map<string, number[]> = new Map()
    for (const modelPath of models) {
        const result = await inferenceModel(allResults, modelPath)

        Array.from(result.entries())
        .map(([userId, scores]) => {
            if (!creditScores.has(userId))
                creditScores.set(userId, [])
    
            scores.map((score) => creditScores.get(userId)?.push(score))
        })
    }

    const ddbEntries = Array.from(creditScores.entries())
    .map(([userId, scores]) => {
        const sum = scores.reduce((acc, curr) => acc + curr, 0);
        const avg = sum / scores.length;
        console.log(`${userId}: ` + JSON.stringify(avg))

        return {
            user_external_id: userId,
            credit_score: JSON.stringify(avg)
        }
    })

    //await transactiondb.insert(credit_score).values(ddbEntries)


}