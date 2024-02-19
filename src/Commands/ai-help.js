const { SlashCommandBuilder, codeBlock } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_TOKEN);
module.exports = {
  data: new SlashCommandBuilder()
    .setName("type-of-project")
    .setDescription("Let Geni generate a project idea for you.")
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type of Project')
        .setRequired(true)
    )
    .addStringOption(op =>
      op.setName('programming-level')
      .setDescription('Your Programming Level')
      .setRequired(false)
    ),
  execute: async (interaction, client) => {

    interaction.deferReply();
    
    // user input of the type of project
    const projectType = interaction.options._hoistedOptions[0].value;
    // user input of the programming level
    const programmingLevel = interaction.options._hoistedOptions[1]?.value || 'Beginner';

    try {
      const model = genAI.getGenerativeModel({model: 'gemini-pro'});
      const prompt = 'You are a programming teacher assistant who helps students with their projects. The students do not know what to code yet so give them some suggestions. Be as detailed as possible' + projectType + 'And their Programming level is' + programmingLevel + '.';
      const result = await model.generateContent(prompt);
      const response = result.response;
      const toSendToStudent = codeBlock('markdown', String(response.text()));
      let splitMessage = toSendToStudent.match(/[\s\S]{1,500}/g) || [];
      console.log('splitMessage', splitMessage);
      console.log('project type', projectType);
      const embed = new MessageEmbed()
      .setTitle('Project Idea')
      .setDescription(`${projectType}`)
      .addFields([
        {name: 'response', value: splitMessage[0] || 'Not Available'},
        {name: 'smaller', value: 'splitMessage' || 'Not Available'},
      ])
      await interaction.editReply({ embeds: [embed] });
      for(const element of splitMessage) {
        // await interaction.editReply({ content: element });
      }


      if (toSendToStudent && toSendToStudent.trim() !== '') {
        // await interaction.editReply({ content: toSendToStudent });
      } else {
        return interaction.editReply({ content: "Sorry, I couldn't generate the content at the moment. Please try again later." });
      }
    } catch (error) {
      console.log('error', error);
      await interaction.editReply({content: 'error'});
    }
  },
};