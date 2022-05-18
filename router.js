const config = require('./config.json')
const Web3 = require('web3')
const web3 = new Web3(process.env.INFURA_URL)

web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY)
const adminAddress = web3.eth.accounts.wallet[0]

const Router = require('@koa/router')
const router = new Router()

const cTokens = {
    cBat: new web3.eth.Contract(
        config.cTokenAbi,
        config.cBatAddress
    ),
    cDai: new web3.eth.Contract(
        config.cTokenAbi,
        config.cBatAddress
    )
}


// Get balance of ERC20 token from address
router.get('/tokenBalance/:cToken/:address', async ctx => {
    const cToken = cTokens[ctx.params.cToken]
    if (typeof cToken === 'undefined') {
        ctx.status = 400
        ctx.body = {
            error: `cToken ${ctx.params.cToken} does not exist\n`
        }
        return
    }

    try {
        const cTokenBalance = await cToken.methods.balanceOfUnderlying(ctx.params.address).call()
        ctx.body = {
            cToken: ctx.params.cToken,
            address: ctx.params.address,
            cTokenBalance,
        }
    } catch (err) {
        console.log(err)
        ctx.status = 500,
        ctx.body = {
            error: 'Internal server error\n' 
        }
    }
})


// Get balance of c token from address
router.get('/cTokenBalance/:cToken/:address', async ctx => {
    const cToken = cTokens[ctx.params.cToken]
    if (typeof cToken === 'undefined') {
        ctx.status = 400
        ctx.body = {
            error: `cToken ${ctx.params.cToken} does not exist\n`
        }
        return
    }

    try {
        const tokenBalance = await cToken.methods.balanceOf(ctx.params.address).call()
        ctx.body = {
            cToken: ctx.params.cToken,
            address: ctx.params.address,
            tokenBalance,
        }
    } catch (err) {
        console.log(err)
        ctx.status = 500,
        ctx.body = {
            error: 'Internal server error\n' 
        }
    }
})

// Mint cToken
router.push('/mint/:cToken/:amount', async ctx => {
    const cToken = cTokens[ctx.params.cToken]
    if (typeof cToken === 'undefined') {
        ctx.status = 400
        ctx.body = {
            error: `cToken ${ctx.params.cToken} does not exist\n`
        }
        return
    }

    const tokenAddress = await cToken.methods.underlying().call()
    const token = new web3.eth.Contract(config.ERC20Abi, tokenAddress)
    await token.methods.approve(cToken.options.address, ctx.params.amount).send({from: adminAddress})

    try {
        const cTokenBalance = await cToken.methods.mint(ctx.params.amount).send({from: adminAddress})
        ctx.body = {
            cToken: ctx.params.cToken,
            address: adminAddress,
            amountMinted: ctx.params.amount,
        }
    } catch (err) {
        console.log(err)
        ctx.status = 500,
        ctx.body = {
            error: 'Internal server error\n' 
        }
    }
})

// Redeem cToken
router.push('/redeem/:cToken/:amount', async ctx => {
    const cToken = cTokens[ctx.params.cToken]
    if (typeof cToken === 'undefined') {
        ctx.status = 400
        ctx.body = {
            error: `cToken ${ctx.params.cToken} does not exist\n`
        }
        return
    }

    try {
        const cTokenBalance = await cToken.methods.redeem(ctx.params.amount).send({from: adminAddress})
        ctx.body = {
            cToken: ctx.params.cToken,
            address: adminAddress,
            amountRedeemed: ctx.params.amount,
        }
    } catch (err) {
        console.log(err)
        ctx.status = 500,
        ctx.body = {
            error: 'Internal server error\n' 
        }
    }
})

module.exports = router