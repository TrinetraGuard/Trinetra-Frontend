import { Github, Linkedin, Mail, Users } from 'lucide-react';

import { motion } from 'framer-motion';

const TeamSection = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Nisarga Lokhande",
      role: "AI/ML Engineer",
      image: "https://media.licdn.com/dms/image/v2/D5603AQFf0LUpm6vKGg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1723629889029?e=1758153600&v=beta&t=SQaXEJ0ClschWjSYna1kuzJeRYJ6Nsx7I1IjoQ-1OJg",
      linkedin: "https://www.linkedin.com/in/nslokhande/",
      github: "https://github.com/nikobuddy",
      email: "priya@trinetra.com"
    },
    {
          id: 2,
      name: "Rushikesh Landge",
      role: "Security Specialist",
      image: "https://media.licdn.com/dms/image/v2/D5635AQGroe21fQanrA/profile-framedphoto-shrink_400_400/profile-framedphoto-shrink_400_400/0/1735480011094?e=1755608400&v=beta&t=s_5rgg-pFt-187er73Wift3wYkOONBWCftziabBRmjI",
      linkedin: "https://www.linkedin.com/in/rushikeshlandge/",
      github: "https://github.com/LandgeRushikesh",
      email: "rushilandge12@gmail.com"
    },
    {
        id: 3,
      name: "Dhanashri Sonawane",
      role: "UX/UI Designer",
      image: "https://media.licdn.com/dms/image/v2/D4E03AQGJwowFc76IwA/profile-displayphoto-shrink_400_400/B4EZQnr875HEAg-/0/1735832622303?e=1758153600&v=beta&t=bYaL_RQaf8_cKryHB2UbQ33vIITaM6mP6As2G_cpctA",
      linkedin: "https://www.linkedin.com/in/dhanashri-sonawane-a254922b1/",
      github: "https://github.com/DhanashriSonawane25",
      email: "dhanashrisonawane2004@gmail.com"
    },
    {
      id: 4,
      name: "Gayatri Vadge",
      role: "DevOps Engineer",
      image: "https://media.licdn.com/dms/image/v2/D5635AQG9Eh2ZJwFibQ/profile-framedphoto-shrink_400_400/profile-framedphoto-shrink_400_400/0/1719404676846?e=1755608400&v=beta&t=5pKJD-spPTIXKa7jqS-eZiQSjLsGlaej8EOYl2L92n0",
      linkedin: "https://www.linkedin.com/in/gayatri-vadge/",
      github: "https://github.com/Gayatriwadge02",
      email: "gayatrivadge@gmail.com"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Meet Our
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              {" "}Team
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            The brilliant minds behind TrinetraGuard, working together to revolutionize pilgrimage security through innovative technology
          </p>
        </motion.div>

        {/* Group Photos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-white font-semibold text-xl mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-400" />
                Development Team
              </h3>
              <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg font-medium">Team Photo 1</p>
                  <p className="text-gray-500 text-sm">1024x1024 pixels</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-white font-semibold text-xl mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-400" />
                Core Team
              </h3>
              <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg font-medium">Team Photo 2</p>
                  <p className="text-gray-500 text-sm">1024x1024 pixels</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-orange-500/30 transition-all duration-300 hover:transform hover:scale-105"
            >
              <div className="text-center">
                {/* Member Image */}
                <div className="relative mb-6">
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden ring-4 ring-orange-500/20 group-hover:ring-orange-500/40 transition-all duration-300">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>

                {/* Member Info */}
                <h3 className="text-white font-semibold text-xl mb-2 group-hover:text-orange-400 transition-colors duration-300">
                  {member.name}
                </h3>
                <p className="text-orange-400 font-medium mb-4">{member.role}</p>

                {/* Social Links */}
                <div className="flex justify-center gap-3">
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-white/10 hover:bg-orange-500 rounded-full flex items-center justify-center transition-all duration-300 hover:transform hover:scale-110"
                    >
                      <Linkedin className="w-5 h-5 text-white" />
                    </a>
                  )}
                  {member.github && (
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-white/10 hover:bg-orange-500 rounded-full flex items-center justify-center transition-all duration-300 hover:transform hover:scale-110"
                    >
                      <Github className="w-5 h-5 text-white" />
                    </a>
                  )}
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="w-10 h-10 bg-white/10 hover:bg-orange-500 rounded-full flex items-center justify-center transition-all duration-300 hover:transform hover:scale-110"
                    >
                      <Mail className="w-5 h-5 text-white" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Team Culture */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white text-center mb-8">Our Team Culture</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-orange-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">Collaboration</h4>
                <p className="text-gray-400 text-sm">We believe in the power of teamwork and shared knowledge</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-orange-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">Innovation</h4>
                <p className="text-gray-400 text-sm">Constantly pushing boundaries to create better solutions</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-orange-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">Growth</h4>
                <p className="text-gray-400 text-sm">Supporting each other's professional and personal development</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TeamSection;
