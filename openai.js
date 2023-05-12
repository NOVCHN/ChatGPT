/**
 * ChatGPT终端版
 * 环境配置: Node版本 >= 18.16.0 NPM版本 >= 9.5.1
 * 
 * Author: NOVCH
 * Date: 2023-05-12
 * Email: me@novch.com
 */

// ChatGPT官方包
let { Configuration, OpenAIApi } = require("openai");

// 终端对话包
let readline = require("readline");

// 终端加载动画包
let Spinner = require("cli-spinner").Spinner;

// 项目配置文件
let config = require("./config/index")

// 初始化openAi
let configuration = new Configuration({
    apiKey: config.key,
});

let openai = new OpenAIApi(configuration);

// 初始化终端加载动画
let spinner = new Spinner("%s");

spinner.setSpinnerString("|/-\\");

// 初始化终端对话
let read = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

// 存储对话记录
let messages = []

// 一个非常帅的作者的信息 >=_=<
console.log('\x1b[36m', "欢迎使用ChatGPT终端版\n 作者: NOVCH");

// 打开终端对话方法
let question = () => {
    console.log('\x1b[35m', "");
    read.question('请输入：', (e) => {
        if (e == "stop") {
            read.close();
            return
        }

        messages.push({
            "role": "user",
            "content": e
        })

        console.log("\x1b[32m","");
        spinner.start();

        get(messages)

    })
}

// 打开终端对话
question()

// 监听对话结束
read.on('close', function () {
    process.exit(0);
});

// 请求ChatGPT
let get = (messages) => {
    openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        presence_penalty: 0,
        stream: true,
        temperature: 0.5,
        messages,
    }, {
        proxy: {
            host: '127.0.0.1',
            port: 7890
        }
    }).then(res => {

        let arr = res.data.split("data:")

        let str = ""

        for (let i = 0; i < arr.length; i++) {
            let e = arr[i]
            if (i > 0 && i < arr.length - 1) {
                let chunk = JSON.parse(e)
                if (chunk.id) {
                    let content = chunk.choices[0].delta.content
                    if (content) {
                        str += content
                    }
                }
            }

        }

        console.log(str + "\n");

        messages.push({
            "role": "system",
            "content": str
        })
        spinner.stop(true);
        question()

    }).catch(error => {
        get(messages)
    })
}

