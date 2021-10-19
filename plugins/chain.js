import { Asset, Client, PrivateKey, PublicKey, cryptoUtils, utils } from '@hiveio/dhive'

export default ({ $config }, inject) => {
  const client = new Client($config.NODES, { failoverThreshold: 20, consoleOnFailover: true })

  const getClient = () => client

  const chain = {
    Asset,
    Client,
    PrivateKey,
    PublicKey,
    cryptoUtils,
    ...utils,
    client,
    getClient
  }

  inject('chain', chain)
}
