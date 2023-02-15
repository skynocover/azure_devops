const express = require("express");
const app = express();
const axios = require("axios");
const qs = require("qs");
const { ethers } = require("ethers");
require("dotenv").config();

const consumerKey = "SfoqlIagsihSXlhhm0EdIA1Vd";
const consumerSecret = "9HTPbRrQVzggardmvs6Ti9WlmIpODaOKyGyIPty0AcBMI4Q4nD";

async function getRequestToken() {
  const oauthSignature = encodeURIComponent(
    `${consumerKey}:${consumerSecret}`
  ).toString("base64");

  const response = await axios({
    method: "post",
    url: "https://api.twitter.com/oauth/request_token",
    headers: {
      Authorization: `Basic ${oauthSignature}`,
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
  });

  return response.data.split("&")[1].split("=")[1];
}

async function getAccessToken(requestToken) {
  const redirectUri = `https://api.twitter.com/oauth/authenticate?oauth_token=${requestToken}`;

  // Redirect the user to the Twitter OAuth authorization page
  window.location.href = redirectUri;

  // After the user grants permission, they will be redirected back to the callback URL
  // The callback URL should contain the oauth_token and oauth_verifier parameters

  const oauthToken = "<OAUTH_TOKEN_FROM_CALLBACK_URL>";
  const oauthVerifier = "<OAUTH_VERIFIER_FROM_CALLBACK_URL>";

  const response = await axios({
    method: "post",
    url: "https://api.twitter.com/oauth/access_token",
    headers: {
      Authorization: `OAuth oauth_consumer_key="${consumerKey}", oauth_token="${oauthToken}", oauth_verifier="${oauthVerifier}"`,
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
  });

  return response.data.split("&")[0].split("=")[1];
}

const getMethodSignature = (functionName, inputs) => {
  const encoded = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(functionName + "(" + inputs.join(",") + ")")
  );
  return "0x" + encoded.slice(0, 8);
};

function hashInputData(functionSignature, inputs) {
  return (
    functionSignature + ethers.utils.hexlify(utils.encode(inputs)).slice(2)
  );
}

(async () => {
  try {
    return;
    // const requestToken = await getRequestToken();
    // console.log({ requestToken });
    // const provider = new ethers.providers.JsonRpcProvider(
    //   process.env.ALCHEMY_URL
    // );
    // const provider = new ethers.providers.AlchemyProvider("goerli");
    const provider = new ethers.providers.EtherscanProvider("goerli");

    // 實體化合約
    this.contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      [
        {
          inputs: [
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
          ],
          name: "balanceOf",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
      provider
    );
    // const num = Number(
    //   await this.contract.balanceOf(
    //     "0x79691097A2C68d70f1d3fDAd021195E96ae0BE93",
    //     { blockNumber: 7906669 }
    //   )
    // );
    // console.log({ num, t: typeof num });
    // const methodSignature = getMethodSignature("safeTransferFrom", ["uint256"]);
    // console.log(methodSignature);

    const iface = new ethers.utils.Interface([
      {
        inputs: [
          {
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "safeTransferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "transferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ]);
    const selector = iface.getSighash("safeTransferFrom");
    // const selector = iface.getSighash("transferFrom");
    console.log({ selector });

    const address = "0x79691097a2c68d70f1d3fdad021195e96ae0be93";

    // console.log({ provider });

    // // const transactionHistory = await provider.getHistory(address);

    // let etherscanProvider = new ethers.providers.EtherscanProvider();
    // etherscanProvider.getHistory(address).then((history) => {
    //   history.forEach((tx) => {
    //     console.log(tx);
    //   });
    // });
    // return;

    const transactionHistory = await provider.getHistory(address);
    console.log(transactionHistory.length);

    // Iterate over the transaction history
    for (const transaction of transactionHistory) {
      //   console.log(transaction);
      if (transaction.to === process.env.CONTRACT_ADDRESS) {
        // Check if the transaction data matches the method signature
        if (transaction.data.startsWith(selector)) {
          console.log(transaction);
          console.log(
            `Address ${address} used method ${selector} in transaction ${transaction.hash}`
          );
          //   return true;
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
  //   const accessToken = await getAccessToken(requestToken);

  //   console.log(`Access Token: ${accessToken}`);
})();

app.get("/", function (req, res) {
  console.log(req.url);
  const code = req.query.code;
  console.log(code);
  //   console.log(req.body);
  //   res.send("Hello World");

  const data = {
    client_id: "1070604727206817792",
    client_secret: "16YbZ1gy59lrgqYIFd_G9BrDr4hALfqq",
    grant_type: "authorization_code",
    code,
    redirect_uri: "http://localhost:3000",
  };
  const options = {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    data: qs.stringify(data),
    url: "https://discord.com/api/oauth2/token",
  };
  axios(options)
    .then(({ data }) => {
      //   console.log(data);
      const { access_token, refresh_token } = data;
      console.log({ access_token });
      axios
        .get("https://discord.com/api/users/@me", {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        .then(({ data }) => {
          console.log(data);
        })
        .catch((err) => {
          console.error(err.response.data);
        });
    })
    .catch((err) => {
      console.error(err.response.data);
    });
});

app.get("/check", (req, res) => {
  console.log("success");
  res.send("success");
});

app.listen(3000);
