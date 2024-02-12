const { SlashCommandBuilder, codeBlock } = require("@discordjs/builders");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_TOKEN);
module.exports = {
  data: new SlashCommandBuilder()
    .setName("ai-help")
    .setDescription("Let Geni help you with your project."),
  execute: async (interaction, client) => {

    interaction.deferReply();

    try {
      const model = genAI.getGenerativeModel({model: 'gemini-pro'});
      const prompt = 'Help me generate ideas for a API project.';
      const result = await model.generateContent(prompt);
      const response = result.response;
      const toSendToStudent = codeBlock('markdown', String(response.text()));
      console.log('this to send', toSendToStudent);
      
      await interaction.editReply({content: toSendToStudent});
      
    } catch (error) {
      interaction.deferReply();
      console.log('error with AI', error);
      await interaction.editReply({content: error.data});
    }
  },
};
