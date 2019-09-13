const exportHeaders = {
  id: 0,
  name: 1,
  domain: 2,
  email: 3,
  accountActive: 4,
  dateCreated: 5,
  accountType: 6,
  lastAction: 7,
  signedUp: 8,
  numberRecords: 9
};

/** Class representing an SCCRM instance. */
class Instance {
  /**
   * Instantiate an SCCRM instance.
   * @param {Number} id
   * @param {String} name
   * @param {String} editUrl
   * @param {String} domain
   * @param {String} siteUrl
   * @param {String} email
   * @param {Boolean} accountActive
   * @param {String} dateCreated
   * @param {String} accountType
   * @param {String} lastAction
   * @param {String} signedUp
   * @param {Number} numRecords
   * @param {Boolean} flagged
   */
  constructor(
    id,
    name,
    editUrl,
    domain,
    siteUrl,
    email,
    accountActive,
    dateCreated,
    accountType,
    lastAction,
    signedUp,
    numRecords,
    flagged
  ) {
    this.id = id;
    this.name = name;
    this.editUrl = editUrl;
    this.domain = domain;
    this.siteUrl = siteUrl;
    this.email = email;
    this.accountActive = accountActive;
    this.dateCreated = dateCreated;
    this.accountType = accountType;
    this.lastAction = lastAction;
    this.signedUp = signedUp;
    this.numRecords = numRecords;
    this.flagged = flagged;
  }

  /**
   * Scrape instances from the SCCRM admin portal.
   * @return {Array.<HTMLCollection>} The instances.
   */
  static fetchInstances() {
    document.getElementsByTagName('tr');
  }

  static test() {
    console.log('Hello World from the Instance class');
  }

  static setupInstances(fetchedInstances) {
    let instantiated = [];
    fetchedInstances.forEach(i => {
      const newInstance = new Instance(
        Number(i.children[exportHeader.id].innerText),
        i.children[exportHeaders.name].children[0].innerText,
        i.children[exportHeaders.name].children[0].attributes['href'].value,
        i.children[exportHeaders.domain].children[0].innerText,
        i.children[exportHeaders.domain].children[0].attributes['href'].value,
        i.children[exportHeaders.email].innerText,
        i.children[exportHeaders.accountActive].innerText === 'Yes',
        i.children[exportHeaders.dateCreated].innerText,
        i.children[exportHeaders.accountType].innerText,
        i.children[exportHeaders.lastAction].innerText,
        i.children[exportHeaders.signedUp].innerText,
        i.children[exportHeaders.numberRecords].innerText,
        i.children[headers.name].className === 'status-3'
      );
      instantiated.push(newInstance);
    });
    return instantiated;
  }

  /**
   * Filters a list of instances by name
   * @param {Array.<HTMLCollection>} instances
   * @param {String} name
   * @returns {Array.<HTMLCollection>}
   */
  static getInstanceByName(instances, name) {
    instances.filter(i => i.name.toLowerCase().includes(name.toLowerCase()));
  }

  /**
   * Filters a list of instances by email
   * @param {Array.<HTMLCollection>} instances
   * @param {String} email
   * @returns {Array.<HTMLCollection>}
   */
  static getInstanceByEmail(instances, email) {
    instances.filter(i => i.email.toLowerCase().includes(email.toLowerCase()));
  }

  /**
   * Filters a list of instances by domain
   * @param {Array.<HTMLCollection>} instances
   * @param {String} domain
   * @returns {Array.<HTMLCollection>}
   */
  static getInstanceByDomain(instances, domain) {
    instances.filter(i => i.domain.toLowerCase().includes(domain.toLowerCase()));
  }
}

module.exports = Instance;
