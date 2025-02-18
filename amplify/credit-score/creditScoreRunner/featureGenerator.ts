import { sql } from "drizzle-orm"

export default function FeatureGenerator(userList: string[]) {

     const query = sql.raw(`select user_external_id,
min(date) as first_tranasctioin_date,
max(date) as last_tranasctioin_date,
MAX(date) - MIN(date) AS transaction_tenor,
-- BNPL--
case when count(
case when personal_finance_category__detailed = 'LOAN_PAYMENTS_PERSONAL_LOAN_PAYMENT' 
and LOWER(
    CASE 
        WHEN POSITION(' ' IN transaction ->> 'original_description') > 0 
        THEN SUBSTRING(transaction ->> 'original_description' FROM 1 FOR POSITION(' ' IN transaction ->> 'original_description') - 1)
        ELSE transaction ->> 'original_description'
    END
) IN ('clearpay', 'zilch', 'payl8r.com', 'klarna', 'payl8r', 'laybuy','snap finance')
   and lower(personal_finance_category__confidence_level) in ('high','very_high')
     and (transaction ->> 'amount')::numeric > 0 then user_external_id else NULL
     end
) >1 then 1 else 0 end as BNPL_flag,
-- CREDIT UNION--
case when count(
case when lower(transaction ->> 'original_description')like '%novocash%'
or lower(transaction ->> 'original_description') like '%wave cb%' 
or lower(transaction ->> 'original_description') like '%eslcu%' 
and personal_finance_category__detailed = 'LOAN_PAYMENTS_PERSONAL_LOAN_PAYMENT' 
/*and lower(
    case 
        WHEN POSITION(' ' IN transaction ->> 'original_description') > 0 
        THEN SUBSTRING(transaction ->> 'original_description' FROM 1 FOR POSITION(' ' IN transaction ->> 'original_description') - 1)
        ELSE transaction ->> 'original_description'
    END
) IN ('novocash1459','wave','eslcu')*/
     and (transaction ->> 'amount')::numeric > 0  then user_external_id else NULL
     end
) >1 then 1 else 0 end as Credit_Union_flag,
--CREDIT CARD-- 
case when count(
case when personal_finance_category__detailed = 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT'
   and lower(personal_finance_category__confidence_level) in ('high','very_high')
     and (transaction ->> 'amount')::numeric > 0 then user_external_id else NULL
     end
) >1 then 1 else 0 end as Credit_Card_flag,
-- CAR -- 
case when count(
case when lower(transaction ->> 'original_description') like '%dvla%'
     and (transaction ->> 'amount')::numeric > 0 then user_external_id else NULL
     end
) >1 then 1 else 0 end as Has_Car_flag,
--MORTGAGE-- 
case when count(
case when personal_finance_category__detailed = 'LOAN_PAYMENTS_MORTGAGE_PAYMENT'
   and lower(personal_finance_category__confidence_level) in ('high','very_high')
     and (transaction ->> 'amount')::numeric > 0 then user_external_id else NULL
     end
) >1 then 1 else 0 end as Mortgage_flag,
--CAR FINANCE-- 
case when count(
case when personal_finance_category__detailed = 'LOAN_PAYMENTS_CAR_PAYMENT'
or lower(transaction ->> 'original_description') like '%marsh finance%' 
or lower(transaction ->> 'original_description') like '%moneybarn%' 
or lower(transaction ->> 'original_description') like '%first response%' 
or lower(transaction ->> 'original_description') like '%car finance%' 
   and lower(personal_finance_category__confidence_level) in ('high','very_high')
     and (transaction ->> 'amount')::numeric > 0 then user_external_id else NULL
     end
) >1 then 1 else 0 end as Car_Finance_flag,
-- PROPERTY RENTAL FLAG --
case when count(
case when personal_finance_category__detailed = 'RENT_AND_UTILITIES_RENT'
and (transaction ->> 'amount')::numeric > 100  then user_external_id else NULL
     end
) >1 then 1 else 0 end as Property_Rental_flag,
-- ARRANGED OVERDRAFT -- 
case when count(
case when personal_finance_category__detailed = 'BANK_FEES_OVERDRAFT_FEES'
and (transaction ->> 'amount')::numeric > 0  then user_external_id else NULL
     end
) >1 then 1 else 0 end as Arranged_Overdraft_flag,
--RETURNED PAYMENT -- 
case when count(
case when lower(transaction ->> 'original_description') like '%reversal%' 
or lower(transaction ->> 'original_description') like '%returned%'
and (transaction ->> 'amount')::numeric < 0  then user_external_id else NULL
     end
) >1 then 1 else 0 end as Returned_Payment_flag,
--BETTING FLAG-
case when count(
case when lower(transaction ->> 'original_description')like '%bet%'
or lower(transaction ->> 'original_description') like '%bet365%' 
or lower(transaction ->> 'original_description') like '%betfair%' 
or lower(transaction ->> 'original_description') like '%unibet%' 
or lower(transaction ->> 'original_description') like '%willam hill%'
or lower(transaction ->> 'original_description') like '%betting%'
or lower(transaction ->> 'original_description') like '%32 red%'
or lower(transaction ->> 'original_description') like '%willamhill%'
or lower(transaction ->> 'original_description') like '%jenning%'
or lower(transaction ->> 'original_description') like '%admiral%' 
or lower(transaction ->> 'original_description') like '%mrq%'
and personal_finance_category__detailed = 'ENTERTAINMENT_CASINOS_AND_GAMBLING'
    and (transaction ->> 'amount')::numeric > 0 then user_external_id else NULL
     end
) >1 then 1 else 0 end as Betting_flag,
--CASINO & BINGO FLAG --
case when count(
case when lower(transaction ->> 'original_description')like '%paddy power%'
or lower(transaction ->> 'original_description') like '%eldorado.gg%'
or lower(transaction ->> 'original_description') like '%virgin game%'
or lower(transaction ->> 'original_description') like '%aviagame%'
or lower(transaction ->> 'original_description') like '%boylesport%'
or lower(transaction ->> 'original_description') like '%lc intern%'
or lower(transaction ->> 'original_description') like '%lci ltd%' 
or lower(transaction ->> 'original_description') like '%admiral%' 
or lower(transaction ->> 'original_description') like '%casino%' 
or lower(transaction ->> 'original_description') like '%bingo%' 
or lower(transaction ->> 'original_description') like '%tombola%' 
or lower(transaction ->> 'original_description') like '%poker%' 
or lower(transaction ->> 'original_description') like '%ballycasino%'
or lower(transaction ->> 'original_description') like '%skill on net%'
or lower(transaction ->> 'original_description')like '%broadway gaming%'
and personal_finance_category__detailed = 'ENTERTAINMENT_CASINOS_AND_GAMBLING'
    and (transaction ->> 'amount')::numeric > 0 then user_external_id else NULL
     end
) >1 then 1 else 0 end as Casino_Bingo_flag,

-- LOTTERY FLAG --
case when count(
case when lower(transaction ->> 'original_description')like '%lottery%'
or lower(transaction ->> 'original_description') like '%lotto%'
or lower(transaction ->> 'original_description') like '%jackpot%'
and personal_finance_category__detailed = 'ENTERTAINMENT_CASINOS_AND_GAMBLING'
    and (transaction ->> 'amount')::numeric > 0 then user_external_id else NULL
     end
) >1 then 1 else 0 end as Lottery_flag,
-- LOAN FLAG --
case when count(
case when lower(transaction ->> 'original_description') like '%valleys finance%' 
or lower(transaction ->> 'original_description')like '%novuna%'
or lower(transaction ->> 'original_description') like '%credit genius%' 
or lower(transaction ->> 'original_description') like '%creditspring%' 
or lower(transaction ->> 'original_description')like '%salad money%'
or lower(transaction ->> 'original_description') like '%lender%' 
or lower(transaction ->> 'original_description') like '%fernovo%' 
or lower(transaction ->> 'original_description')like '%hsbc plc loans%'
or lower(transaction ->> 'original_description') like '%loans2go%' 
or lower(transaction ->> 'original_description') like '%everyday lending%' 
or lower(transaction ->> 'original_description') like '%lendingstream%'
or lower(transaction ->> 'original_description') like '%ann finance%' 
or lower(transaction ->> 'original_description') like '%loan%' 
or lower(transaction ->> 'original_description') like '%lend%' 
or lower(transaction ->> 'original_description') like '%cashfloat%' 
or lower(transaction ->> 'original_description') like '%vanquis%' -- loans

--lower(transaction ->> 'original_description')like '%loan%'
--or lower(transaction ->> 'original_description')like '%lend%'
and personal_finance_category__detailed = 'LOAN_PAYMENTS_PERSONAL_LOAN_PAYMENT'
--and personal_finance_category__confidence_level in ('HIGH','VERY_HIGH')
--and (transaction ->> 'amount')::numeric < 0 
then user_external_id else NULL
     end
) >1 then 1 else 0 end as Loan_flag,
-- DEBT COLLECTION FLAG --
case when count(
case when lower(transaction ->> 'original_description')like '%paycrs%'
or lower(transaction ->> 'original_description') like '%credit resource%'
or lower(transaction ->> 'original_description') like '%arvato%'
or lower(transaction ->> 'original_description') like '%united kash%'
or lower(transaction ->> 'original_description') like '%debit finance%'
or lower(transaction ->> 'original_description') like '%gw financial%'
or lower(transaction ->> 'original_description') like '%commercial collection%'
and personal_finance_category__detailed = 'LOAN_PAYMENTS_PERSONAL_LOAN_PAYMENT'
    and (transaction ->> 'amount')::numeric > 0 then user_external_id else NULL
     end
) >1 then 1 else 0 end as Debt_Collection_flag,
--------------------------------------------------------------------------
/* FREQUENCY FEATURES */
--------------------------------------------------------------------------
-- DEBT COLLECTION TRANSACTION COUNT --
count(
case when lower(transaction ->> 'original_description')like '%paycrs%'
or lower(transaction ->> 'original_description') like '%credit resource%'
or lower(transaction ->> 'original_description') like '%arvato%'
or lower(transaction ->> 'original_description') like '%united kash%'
or lower(transaction ->> 'original_description') like '%debit finance%'
or lower(transaction ->> 'original_description') like '%gw financial%'
or lower(transaction ->> 'original_description') like '%commercial collection%'
and personal_finance_category__detailed = 'LOAN_PAYMENTS_PERSONAL_LOAN_PAYMENT'
and (transaction ->> 'amount')::numeric > 0 
then user_external_id else NULL end
) as count_debt_collection_transaction,
-- RETURNED PAYMENT COUNT --
count(
case when lower(transaction ->> 'original_description') like '%reversal%' 
or lower(transaction ->> 'original_description') like '%returned%'
and (transaction ->> 'amount')::numeric < 0  then user_external_id else NULL
     end
) as Returned_Payment_count,
--CAR FINANCE COUNT-- 
count(
case when personal_finance_category__detailed = 'LOAN_PAYMENTS_CAR_PAYMENT'
or lower(transaction ->> 'original_description') like '%marsh finance%' 
or lower(transaction ->> 'original_description') like '%moneybarn%' 
or lower(transaction ->> 'original_description') like '%first response%' 
or lower(transaction ->> 'original_description') like '%car finance%' 
   and lower(personal_finance_category__confidence_level) in ('high','very_high')
     and (transaction ->> 'amount')::numeric > 0 then user_external_id else NULL
     end
) as Car_finance_count,
-- BNPL COUNT--
count(
case when personal_finance_category__detailed = 'LOAN_PAYMENTS_PERSONAL_LOAN_PAYMENT' 
and LOWER(
    CASE 
        WHEN POSITION(' ' IN transaction ->> 'original_description') > 0 
        THEN SUBSTRING(transaction ->> 'original_description' FROM 1 FOR POSITION(' ' IN transaction ->> 'original_description') - 1)
        ELSE transaction ->> 'original_description'
    END
) IN ('clearpay', 'zilch', 'payl8r.com', 'klarna', 'payl8r', 'laybuy','snap finance')
   and lower(personal_finance_category__confidence_level) in ('high','very_high')
     and (transaction ->> 'amount')::numeric > 0 then user_external_id else NULL
     end
) as BNPL_transaction_count,
count(
case when lower(transaction ->> 'original_description') like '%valleys finance%' 
or lower(transaction ->> 'original_description')like '%novuna%'
or lower(transaction ->> 'original_description') like '%credit genius%' 
or lower(transaction ->> 'original_description') like '%creditspring%' 
or lower(transaction ->> 'original_description')like '%salad money%'
or lower(transaction ->> 'original_description') like '%lender%' 
or lower(transaction ->> 'original_description') like '%fernovo%' 
or lower(transaction ->> 'original_description')like '%hsbc plc loans%'
or lower(transaction ->> 'original_description') like '%loans2go%' 
or lower(transaction ->> 'original_description') like '%everyday lending%' 
or lower(transaction ->> 'original_description') like '%lendingstream%'
or lower(transaction ->> 'original_description') like '%ann finance%' 
or lower(transaction ->> 'original_description') like '%loan%' 
or lower(transaction ->> 'original_description') like '%lend%' 
or lower(transaction ->> 'original_description') like '%cashfloat%' 
or lower(transaction ->> 'original_description') like '%vanquis%' -- loans

and personal_finance_category__detailed = 'LOAN_PAYMENTS_PERSONAL_LOAN_PAYMENT'
--and personal_finance_category__confidence_level in ('HIGH','VERY_HIGH')
--and (transaction ->> 'amount')::numeric < 0 
then user_external_id else NULL
     end
) as Loan_repayment_count,
count (distinct(
case when lower(transaction ->> 'original_description') like '%valleys finance%' 
or lower(transaction ->> 'original_description')like '%novuna%'
or lower(transaction ->> 'original_description') like '%credit genius%' 
or lower(transaction ->> 'original_description') like '%creditspring%' 
or lower(transaction ->> 'original_description')like '%salad money%'
or lower(transaction ->> 'original_description') like '%lender%' 
or lower(transaction ->> 'original_description') like '%fernovo%' 
or lower(transaction ->> 'original_description')like '%hsbc plc loans%'
or lower(transaction ->> 'original_description') like '%loans2go%' 
or lower(transaction ->> 'original_description') like '%everyday lending%' 
or lower(transaction ->> 'original_description') like '%lendingstream%'
or lower(transaction ->> 'original_description') like '%ann finance%' 
or lower(transaction ->> 'original_description') like '%loan%' 
or lower(transaction ->> 'original_description') like '%lend%' 
or lower(transaction ->> 'original_description') like '%cashfloat%' 
or lower(transaction ->> 'original_description') like '%vanquis%' -- loans
and personal_finance_category__detailed = 'LOAN_PAYMENTS_PERSONAL_LOAN_PAYMENT'
and personal_finance_category__confidence_level in ('HIGH','VERY_HIGH')
then  lower(transaction ->> 'original_description') else NULL
     end
)) as Loan_count,
--- REGULAR INCOME COUNT ---
count(
case when (transaction ->> 'amount')::numeric < 0
and personal_finance_category__detailed in ('INCOME_WAGES','INCOME_TAX_REFUND','INCOME_RETIREMENT_PENSION')
and personal_finance_category__confidence_level in ('HIGH','VERY_HIGH')
then user_external_id else NULL end)
as regular_income_count,
--------------------------------------------------------------------------
/* MONETARY FEATURES */
--------------------------------------------------------------------------
-- DEBT COLLECTION REPAYMENT --
SUM(
case when lower(transaction ->> 'original_description')like '%paycrs%'
or lower(transaction ->> 'original_description') like '%credit resource%'
or lower(transaction ->> 'original_description') like '%arvato%'
or lower(transaction ->> 'original_description') like '%united kash%'
or lower(transaction ->> 'original_description') like '%debit finance%'
or lower(transaction ->> 'original_description') like '%gw financial%'
or lower(transaction ->> 'original_description') like '%commercial collection%'
and personal_finance_category__detailed = 'LOAN_PAYMENTS_PERSONAL_LOAN_PAYMENT'
and (transaction ->> 'amount')::numeric > 0 
then (transaction ->> 'amount')::numeric else 0 end
) as Debt_Collection_repayment,
-- DEPOSIT TO WITHDRAWAL RATIO --
Coalesce(
SUM(
case when personal_finance_category__detailed = 'TRANSFER_IN_DEPOSIT' 
--and personal_finance_category__confidence_level in ('VERY_HIGH','HIGH')
and (transaction ->> 'amount')::numeric < 0
then abs((transaction ->> 'amount')::numeric) else 0 end)
/
NULLIF(SUM(
case when personal_finance_category__detailed = 'TRANSFER_OUT_WITHDRAWAL' 
--and personal_finance_category__confidence_level in ('VERY_HIGH','HIGH')
and (transaction ->> 'amount')::numeric >0
then (transaction ->> 'amount')::numeric else 0 end),0),0) as deposit_withdrawal_ratio,
-- AVERAGE WITHDRAWAL AMOUNT --
coalesce(avg(
case when personal_finance_category__detailed = 'TRANSFER_OUT_WITHDRAWAL' 
and (transaction ->> 'amount')::numeric >0
then abs((transaction ->> 'amount')::numeric) else 0 end),0) as avg_cash_withdrawal,
-- AVERAGE CHARITABLE AMOUNT --
coalesce(avg(
case when personal_finance_category__detailed = 'GOVERNMENT_AND_NON_PROFIT_DONATIONS' 
and personal_finance_category__confidence_level in ('VERY_HIGH','HIGH')
and (transaction ->> 'amount')::numeric > 0
then abs((transaction ->> 'amount')::numeric) else 0 end),0) as avg_charitable_giving,
-- AVERAGE DEBT AMOUNT --
coalesce(
avg(
case when 
 lower(transaction ->> 'original_description')like '%paycrs%'
or lower(transaction ->> 'original_description') like '%credit resource%'
or lower(transaction ->> 'original_description') like '%arvato%'
or lower(transaction ->> 'original_description') like '%united kash%'
or lower(transaction ->> 'original_description') like '%debit finance%'
or lower(transaction ->> 'original_description') like '%gw financial%'
or lower(transaction ->> 'original_description') like '%commercial collection%' -- debt collection
or LOWER(
    CASE 
        WHEN POSITION(' ' IN transaction ->> 'original_description') > 0 
        THEN SUBSTRING(transaction ->> 'original_description' FROM 1 FOR POSITION(' ' IN transaction ->> 'original_description') - 1)
        ELSE transaction ->> 'original_description'
    END
) IN ('clearpay', 'zilch', 'payl8r.com', 'klarna', 'payl8r', 'laybuy','snap finance') -- bnpl
or lower(transaction ->> 'original_description') like '%marsh finance%' 
or lower(transaction ->> 'original_description') like '%moneybarn%' 
or lower(transaction ->> 'original_description') like '%first response%' 
or lower(transaction ->> 'original_description') like '%car finance%' -- car finance
or personal_finance_category__detailed = 'LOAN_PAYMENTS_MORTGAGE_PAYMENT' -- mortgage
or personal_finance_category__detailed = 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT' -- credit card
or lower(transaction ->> 'original_description')like '%novocash%'
or lower(transaction ->> 'original_description') like '%wave cb%' 
or lower(transaction ->> 'original_description') like '%eslcu%' -- credit union


or lower(transaction ->> 'original_description') like '%valleys finance%' 
or lower(transaction ->> 'original_description')like '%novuna%'
or lower(transaction ->> 'original_description') like '%credit genius%' 
or lower(transaction ->> 'original_description') like '%creditspring%' 
or lower(transaction ->> 'original_description')like '%salad money%'
or lower(transaction ->> 'original_description') like '%lender%' 
or lower(transaction ->> 'original_description') like '%fernovo%' 
or lower(transaction ->> 'original_description')like '%hsbc plc loans%'
or lower(transaction ->> 'original_description') like '%loans2go%' 
or lower(transaction ->> 'original_description') like '%everyday lending%' 
or lower(transaction ->> 'original_description') like '%lendingstream%'
or lower(transaction ->> 'original_description') like '%ann finance%' 
or lower(transaction ->> 'original_description') like '%loan%' 
or lower(transaction ->> 'original_description') like '%lend%' 
or lower(transaction ->> 'original_description') like '%cashfloat%' 
or lower(transaction ->> 'original_description') like '%vanquis%' -- loans
and personal_finance_category__confidence_level in ('VERY_HIGH','HIGH')
and (transaction ->> 'amount')::numeric > 0
then abs((transaction ->> 'amount')::numeric) else 0 end),0) as avg_debt,
-- TOTAL LOANS AMOUNT --
coalesce(
sum(
case when (transaction ->> 'amount')::numeric < 0
and (lower(transaction ->> 'original_description') like '%valleys finance%' 
or lower(transaction ->> 'original_description')like '%novuna%'
or lower(transaction ->> 'original_description') like '%credit genius%' 
or lower(transaction ->> 'original_description') like '%creditspring%' 
or lower(transaction ->> 'original_description')like '%salad money%'
or lower(transaction ->> 'original_description') like '%lender%' 
or lower(transaction ->> 'original_description') like '%fernovo%' 
or lower(transaction ->> 'original_description')like '%hsbc plc loans%'
or lower(transaction ->> 'original_description') like '%loans2go%' 
or lower(transaction ->> 'original_description') like '%everyday lending%' 
or lower(transaction ->> 'original_description') like '%lendingstream%'
or lower(transaction ->> 'original_description') like '%ann finance%' 
or lower(transaction ->> 'original_description') like '%loan%' 
or lower(transaction ->> 'original_description') like '%lend%' 
or lower(transaction ->> 'original_description') like '%cashfloat%' 
or lower(transaction ->> 'original_description') like '%vanquis%') 
--and personal_finance_category__confidence_level in ('VERY_HIGH','HIGH')
then abs((transaction ->> 'amount')::numeric) else 0 end),0) as total_loans,
-- TOTAL DEBIT LOANS AMOUNT --
coalesce(
sum(
case when (transaction ->> 'amount')::numeric > 0
and (lower(transaction ->> 'original_description') like '%valleys finance%' 
or lower(transaction ->> 'original_description')like '%novuna%'
or lower(transaction ->> 'original_description') like '%credit genius%' 
or lower(transaction ->> 'original_description') like '%creditspring%' 
or lower(transaction ->> 'original_description')like '%salad money%'
or lower(transaction ->> 'original_description') like '%lender%' 
or lower(transaction ->> 'original_description') like '%fernovo%' 
or lower(transaction ->> 'original_description')like '%hsbc plc loans%'
or lower(transaction ->> 'original_description') like '%loans2go%' 
or lower(transaction ->> 'original_description') like '%everyday lending%' 
or lower(transaction ->> 'original_description') like '%lendingstream%'
or lower(transaction ->> 'original_description') like '%ann finance%' 
or lower(transaction ->> 'original_description') like '%loan%' 
or lower(transaction ->> 'original_description') like '%lend%' 
or lower(transaction ->> 'original_description') like '%cashfloat%' 
or lower(transaction ->> 'original_description') like '%vanquis%') 
--and personal_finance_category__confidence_level in ('VERY_HIGH','HIGH')
then abs((transaction ->> 'amount')::numeric) else 0 end),0) as total_debit_loans,
-- LOAN COVERAGE RATIO --
coalesce(
sum(
case when (transaction ->> 'amount')::numeric < 0
and (lower(transaction ->> 'original_description') like '%valleys finance%' 
or lower(transaction ->> 'original_description')like '%novuna%'
or lower(transaction ->> 'original_description') like '%credit genius%' 
or lower(transaction ->> 'original_description') like '%creditspring%' 
or lower(transaction ->> 'original_description')like '%salad money%'
or lower(transaction ->> 'original_description') like '%lender%' 
or lower(transaction ->> 'original_description') like '%fernovo%' 
or lower(transaction ->> 'original_description')like '%hsbc plc loans%'
or lower(transaction ->> 'original_description') like '%loans2go%' 
or lower(transaction ->> 'original_description') like '%everyday lending%' 
or lower(transaction ->> 'original_description') like '%lendingstream%'
or lower(transaction ->> 'original_description') like '%ann finance%' 
or lower(transaction ->> 'original_description') like '%loan%' 
or lower(transaction ->> 'original_description') like '%lend%' 
or lower(transaction ->> 'original_description') like '%cashfloat%' 
or lower(transaction ->> 'original_description') like '%vanquis%') 
--and personal_finance_category__confidence_level in ('VERY_HIGH','HIGH')
then abs((transaction ->> 'amount')::numeric) else NULL end)
/
NULLIF(sum(
case when (transaction ->> 'amount')::numeric > 0
and (lower(transaction ->> 'original_description') like '%valleys finance%' 
or lower(transaction ->> 'original_description')like '%novuna%'
or lower(transaction ->> 'original_description') like '%credit genius%' 
or lower(transaction ->> 'original_description') like '%creditspring%' 
or lower(transaction ->> 'original_description')like '%salad money%'
or lower(transaction ->> 'original_description') like '%lender%' 
or lower(transaction ->> 'original_description') like '%fernovo%' 
or lower(transaction ->> 'original_description')like '%hsbc plc loans%'
or lower(transaction ->> 'original_description') like '%loans2go%' 
or lower(transaction ->> 'original_description') like '%everyday lending%' 
or lower(transaction ->> 'original_description') like '%lendingstream%'
or lower(transaction ->> 'original_description') like '%ann finance%' 
or lower(transaction ->> 'original_description') like '%loan%' 
or lower(transaction ->> 'original_description') like '%lend%' 
or lower(transaction ->> 'original_description') like '%cashfloat%' 
or lower(transaction ->> 'original_description') like '%vanquis%') 
--and personal_finance_category__confidence_level in ('VERY_HIGH','HIGH')
then abs((transaction ->> 'amount')::numeric) else NULL end),0),0) as loan_coverage_ratio,
-- TOTAL INFLOW ---
coalesce(
sum(
case when (transaction ->> 'amount')::numeric < 0
then abs((transaction ->> 'amount')::numeric) else NULL end),0) as total_inflow,
-- AVERAGE INFLOW ---
round(coalesce(
avg(
case when (transaction ->> 'amount')::numeric < 0
then abs((transaction ->> 'amount')::numeric) else NULL end),0)) as avg_inflow,

-- TOTAL OUTFLOW / EXPENDITURE -- 
coalesce(
sum(
case when (transaction ->> 'amount')::numeric > 0
then abs((transaction ->> 'amount')::numeric) else NULL end),0) as total_outflow,

--- OUTFLOW TO INFLOW RATIO ---
round(coalesce(
sum(
case when (transaction ->> 'amount')::numeric > 0
then abs((transaction ->> 'amount')::numeric) else NULL end)
/
NULLIF(sum(
case when (transaction ->> 'amount')::numeric < 0
then abs((transaction ->> 'amount')::numeric) else NULL end),0)
,0),6) as outlfow_to_inflow_ratio,

-- SAVINGS TO INFLOW RATIO ---
round(coalesce(
sum(
case when abs((transaction ->> 'amount')::numeric) > 2
and personal_finance_category__detailed = 'TRANSFER_IN_SAVINGS'
and personal_finance_category__confidence_level in ('HIGH','VERY_HIGH')
then abs((transaction ->> 'amount')::numeric) else NULL end)
/
NULLIF(sum(
case when (transaction ->> 'amount')::numeric < 0
then abs((transaction ->> 'amount')::numeric) else NULL end),0)
,0),6) as savings_to_inflow_ratio,

-- AVG SAVINGS ---
coalesce(
avg(
case when abs((transaction ->> 'amount')::numeric) > 2
and personal_finance_category__detailed = 'TRANSFER_IN_SAVINGS'
and personal_finance_category__confidence_level in ('HIGH','VERY_HIGH')
then abs((transaction ->> 'amount')::numeric) else NULL end),0) as avg_savings,

-- DEBTs TO TOTAL INFLOW RATIO ---
coalesce(
sum(
case when 
 lower(transaction ->> 'original_description')like '%paycrs%'
or lower(transaction ->> 'original_description') like '%credit resource%'
or lower(transaction ->> 'original_description') like '%arvato%'
or lower(transaction ->> 'original_description') like '%united kash%'
or lower(transaction ->> 'original_description') like '%debit finance%'
or lower(transaction ->> 'original_description') like '%gw financial%'
or lower(transaction ->> 'original_description') like '%commercial collection%' -- debt collection
or LOWER(
    CASE 
        WHEN POSITION(' ' IN transaction ->> 'original_description') > 0 
        THEN SUBSTRING(transaction ->> 'original_description' FROM 1 FOR POSITION(' ' IN transaction ->> 'original_description') - 1)
        ELSE transaction ->> 'original_description'
    END
) IN ('clearpay', 'zilch', 'payl8r.com', 'klarna', 'payl8r', 'laybuy','snap finance') -- bnpl
or lower(transaction ->> 'original_description') like '%marsh finance%' 
or lower(transaction ->> 'original_description') like '%moneybarn%' 
or lower(transaction ->> 'original_description') like '%first response%' 
or lower(transaction ->> 'original_description') like '%car finance%' -- car finance
or personal_finance_category__detailed = 'LOAN_PAYMENTS_MORTGAGE_PAYMENT' -- mortgage
or personal_finance_category__detailed = 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT' -- credit card
or lower(transaction ->> 'original_description')like '%novocash%'
or lower(transaction ->> 'original_description') like '%wave cb%' 
or lower(transaction ->> 'original_description') like '%eslcu%' -- credit union


or lower(transaction ->> 'original_description') like '%valleys finance%' 
or lower(transaction ->> 'original_description')like '%novuna%'
or lower(transaction ->> 'original_description') like '%credit genius%' 
or lower(transaction ->> 'original_description') like '%creditspring%' 
or lower(transaction ->> 'original_description')like '%salad money%'
or lower(transaction ->> 'original_description') like '%lender%' 
or lower(transaction ->> 'original_description') like '%fernovo%' 
or lower(transaction ->> 'original_description')like '%hsbc plc loans%'
or lower(transaction ->> 'original_description') like '%loans2go%' 
or lower(transaction ->> 'original_description') like '%everyday lending%' 
or lower(transaction ->> 'original_description') like '%lendingstream%'
or lower(transaction ->> 'original_description') like '%ann finance%' 
or lower(transaction ->> 'original_description') like '%loan%' 
or lower(transaction ->> 'original_description') like '%lend%' 
or lower(transaction ->> 'original_description') like '%cashfloat%' 
or lower(transaction ->> 'original_description') like '%vanquis%' -- loans
--and personal_finance_category__confidence_level in ('VERY_HIGH','HIGH')
and (transaction ->> 'amount')::numeric > 0
then abs((transaction ->> 'amount')::numeric) else 0 end)
/
sum(
case when (transaction ->> 'amount')::numeric < 0
then abs((transaction ->> 'amount')::numeric) else NULL end)

,0) as debt_to_inflow_ratio,
-- GAMBLING TO INFLOW RATIO ---
round(coalesce(
sum(
case when (transaction ->> 'amount')::numeric > 0
and personal_finance_category__detailed = 'ENTERTAINMENT_CASINOS_AND_GAMBLING'
then abs((transaction ->> 'amount')::numeric) else NULL end)
/
NULLIF(sum(
case when (transaction ->> 'amount')::numeric < 0
then abs((transaction ->> 'amount')::numeric) else NULL end),0)
,0),5) as gambling_to_inflow_ratio,

-- GAMBLING TO SALARY/BENFITS RATIO ----
round(coalesce(
sum(
case when (transaction ->> 'amount')::numeric > 0
and personal_finance_category__detailed = 'ENTERTAINMENT_CASINOS_AND_GAMBLING'
then abs((transaction ->> 'amount')::numeric) else NULL end)
/
NULLIF(max(
case when (transaction ->> 'amount')::numeric < 0
and personal_finance_category__detailed in ('INCOME_WAGES','INCOME_TAX_REFUND','INCOME_RETIREMENT_PENSION')
and personal_finance_category__confidence_level in ('HIGH','VERY_HIGH')
then abs((transaction ->> 'amount')::numeric) else NULL end),0)
,0),5) as gambling_to_income_ratio,

--- CUSTOMER SALARY ---
coalesce(max(
case when (transaction ->> 'amount')::numeric < 0
and personal_finance_category__detailed = 'INCOME_WAGES'
--and personal_finance_category__confidence_level in ('HIGH','VERY_HIGH')
then abs((transaction ->> 'amount')::numeric) else NULL end)
,0) as salary,
--- CUSTOMER RENT ---
coalesce(max(
case when (transaction ->> 'amount')::numeric > 100
and personal_finance_category__detailed = 'RENT_AND_UTILITIES_RENT'
--and personal_finance_category__confidence_level in ('HIGH','VERY_HIGH')
then abs((transaction ->> 'amount')::numeric) else NULL end)
,0) as Rent,
--- CUSTOMER MORTGAGE ---
coalesce(max(
case when (transaction ->> 'amount')::numeric > 100
and personal_finance_category__detailed = 'LOAN_PAYMENTS_MORTGAGE_PAYMENT'
--and personal_finance_category__confidence_level in ('HIGH','VERY_HIGH')
then abs((transaction ->> 'amount')::numeric) else NULL end)
,0) as Mortgage,
--- REGULAR INCOME ---
round(coalesce(avg(
case when (transaction ->> 'amount')::numeric < 0
and personal_finance_category__detailed in ('INCOME_WAGES','INCOME_TAX_REFUND','INCOME_RETIREMENT_PENSION')
and personal_finance_category__confidence_level in ('HIGH','VERY_HIGH')
then abs((transaction ->> 'amount')::numeric) else NULL end)
,0)) as avg_regular_income

/* --- THE END---- */
from transactions
where user_external_id in (${userList.map((user) => {return `'${user}'`}).join(',')})
group by user_external_id`)

return query
}