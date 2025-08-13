import { FaCodeBranch, FaExternalLinkAlt, FaGithub, FaStar } from "react-icons/fa";

const GitHubRepos = () => {
  const coreRepos = [
    {
      name: "trinetra-frontend",
      description: "React.js frontend application",
      url: "https://github.com/trinetra-guard/trinetra-frontend",
      stars: 150,
      forks: 45,
      language: "TypeScript"
    },
    {
      name: "trinetra-backend",
      description: "Node.js backend API server",
      url: "https://github.com/trinetra-guard/trinetra-backend",
      stars: 120,
      forks: 32,
      language: "JavaScript"
    },
    {
      name: "trinetra-mobile",
      description: "React Native mobile application",
      url: "https://github.com/trinetra-guard/trinetra-mobile",
      stars: 95,
      forks: 28,
      language: "TypeScript"
    }
  ];

  const supportingRepos = [
    {
      name: "trinetra-ai",
      description: "Machine learning models and AI components",
      url: "https://github.com/trinetra-guard/trinetra-ai",
      stars: 75,
      forks: 18,
      language: "Python"
    },
    {
      name: "trinetra-docs",
      description: "Documentation and guides",
      url: "https://github.com/trinetra-guard/trinetra-docs",
      stars: 45,
      forks: 12,
      language: "Markdown"
    },
    {
      name: "trinetra-deploy",
      description: "Deployment scripts and configurations",
      url: "https://github.com/trinetra-guard/trinetra-deploy",
      stars: 35,
      forks: 8,
      language: "Shell"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-gray-500/10 to-gray-700/10 border border-gray-500/20 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaGithub className="text-gray-400" />
          GitHub Repositories
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-lg">Core Repositories</h4>
            <div className="space-y-3">
              {coreRepos.map((repo, index) => (
                <a
                  key={index}
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-700/50 transition-colors cursor-pointer block"
                >
                  <div className="flex items-center gap-3">
                    <FaGithub className="text-gray-400" />
                    <div className="flex-1">
                      <h5 className="text-white font-medium">{repo.name}</h5>
                      <p className="text-gray-300 text-sm">{repo.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <span className="text-gray-400 flex items-center gap-1">
                          <FaStar className="text-yellow-400" />
                          {repo.stars}
                        </span>
                        <span className="text-gray-400 flex items-center gap-1">
                          <FaCodeBranch className="text-blue-400" />
                          {repo.forks}
                        </span>
                        <span className="text-gray-400">{repo.language}</span>
                      </div>
                    </div>
                    <FaExternalLinkAlt className="text-gray-400 text-sm" />
                  </div>
                </a>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-lg">Supporting Repositories</h4>
            <div className="space-y-3">
              {supportingRepos.map((repo, index) => (
                <a
                  key={index}
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-700/50 transition-colors cursor-pointer block"
                >
                  <div className="flex items-center gap-3">
                    <FaGithub className="text-gray-400" />
                    <div className="flex-1">
                      <h5 className="text-white font-medium">{repo.name}</h5>
                      <p className="text-gray-300 text-sm">{repo.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <span className="text-gray-400 flex items-center gap-1">
                          <FaStar className="text-yellow-400" />
                          {repo.stars}
                        </span>
                        <span className="text-gray-400 flex items-center gap-1">
                          <FaCodeBranch className="text-blue-400" />
                          {repo.forks}
                        </span>
                        <span className="text-gray-400">{repo.language}</span>
                      </div>
                    </div>
                    <FaExternalLinkAlt className="text-gray-400 text-sm" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitHubRepos;
