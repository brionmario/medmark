import Footer from './components/Footer';

/* eslint sort-keys: error */
export default {
  components: {
    h1: ({children}) => (
      <h1
        style={{
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          backgroundImage: 'linear-gradient(90deg,#7928CA,#FF0080)',
        }}
      >
        {children}
      </h1>
    ),
  },
  darkMode: true,
  dateFormatter: date => `Last updated at ${date.toDateString()}`,
  footer: <Footer />,
};
