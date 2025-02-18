import { Construct } from "constructs";
import { Backend } from "../backend";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Code, LayerVersion, Runtime } from "aws-cdk-lib/aws-lambda";
import { Duration } from "aws-cdk-lib";
import { Effect, ManagedPolicy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";
import path from "path";

export class creditScoreStack extends Construct {
    constructor(backend: Backend, id: string) {
        super(backend.stack, id)

        const vpc = Vpc.fromVpcAttributes(this, 'NogginVpc', {
            vpcId: 'vpc-0ea61bcb873b726f5',
            availabilityZones: ['eu-west-2a'],
            privateSubnetIds: ['subnet-0437fec43bbfc92db']
        });

        const securityGroup = SecurityGroup.fromSecurityGroupId(this, 'NogginSecurityGroup', 'sg-04d769c17bc1b53bc')

        const modelLayer = new LayerVersion(this, 'ModelLayer', {
            code: Code.fromAsset(path.join(import.meta.dirname, 'model')),
            compatibleRuntimes: [Runtime.NODEJS_22_X]
        });

        //Lambda to run credit score against signed up users
        const creditScoreRunnerLambda = new NodejsFunction(this, 'CreditScoreRunnerLambda', {
            runtime: Runtime.NODEJS_22_X,
            entry: 'amplify/credit-score/creditScoreRunner/handler.ts',
            environment: {
                'MODEL_PATH_1': '/opt/xgboost_model_fold_1.onnx',
                'MODEL_PATH_2': '/opt/xgboost_model_fold_2.onnx',
                'MODEL_PATH_3': '/opt/xgboost_model_fold_3.onnx',
                'MODEL_PATH_4': '/opt/xgboost_model_fold_4.onnx',
                'MODEL_PATH_5': '/opt/xgboost_model_fold_5.onnx'
            },
            timeout: Duration.seconds(900),
            vpc,
            securityGroups: [securityGroup],
            bundling: {
                nodeModules: ['onnxruntime-node']
            },
            layers: [modelLayer],
        });

        creditScoreRunnerLambda.role?.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AWSLambda_FullAccess'));

        creditScoreRunnerLambda.role?.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'));

        creditScoreRunnerLambda.role?.addToPrincipalPolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                "ec2:DescribeNetworkInterfaces",
                "ec2:CreateNetworkInterface",
                "ec2:DeleteNetworkInterface",
                "ec2:DescribeInstances",
                "ec2:AttachNetworkInterface"
            ],
            resources: ['*']
        }))
    }
}