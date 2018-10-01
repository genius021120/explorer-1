import React, { Component } from 'react';
import { Container, Row, Col, Table } from 'reactstrap';
import moment from 'moment';
import { Title } from '../../components/coreComponent';
import _ from 'lodash';
import Header from 'views/components/header/header';
// import Web3 from 'web3';

import SearchForTransaction from '../../components/search/searchForTransaction/index';

function scientificToDecimal(num) {
  const sign = Math.sign(num);
  // if the number is in scientific notation remove it
  if (/\d+\.?\d*e[\+\-]*\d+/i.test(num)) {
    const zero = '0';
    const parts = String(num).toLowerCase().split('e'); // split into coeff and exponent
    const e = parts.pop(); // store the exponential part
    let l = Math.abs(e); // get the number of zeros
    const direction = e / l; // use to determine the zeroes on the left or right
    const coeff_array = parts[0].split('.');

    if (direction === -1) {
      coeff_array[0] = Math.abs(coeff_array[0]);
      num = `${zero}.${new Array(l).join(zero)}${coeff_array.join('')}`;
    } else {
      const dec = coeff_array[1];
      if (dec) l -= dec.length;
      num = coeff_array.join('') + new Array(l + 1).join(zero);
    }
  }

  if (sign < 0) {
    num = -num;
  }

  return num;
}

export default class Blocks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      transactionArray: [],
      searchText: '',
      walletDetail: {},
      transactionData: [],
      error: '',
    };
  }
  /**
   * @api_key: send private key for security purpose
   * here call a api get-transactions and get data from transactions table.
   */
  componentWillMount() {
    return;
    fetch('http://localhost:3000/api/get-transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        api_key: 'qscvfgrtmncefiur2345',
        limit: 5,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        this.setState({ transactionArray: res.result });
      })
      .catch((error) => {
        console.log('error is !!!', error);
      });
  }

  setSearchText(e) {
    this.setState({
      searchText: e.target.value,
    });
  }

  /**
     * getFantomTransactionsFromApiAsync():  Api to fetch transactions for given address of Fantom own endpoint.
     * @param {String} address : address to fetch transactions.
     */
  getFantomTransactionsFromApiAsync(searchTransactionHash) {
    const url = 'http://18.221.128.6:8080';
    console.log('inside getFantomTransactionsFromApiAsync ');
    // const dummyAddress = '0x68a07a9dc6ff0052e42f4e7afa117e90fb896eda168211f040da69606a2aeddc';
    fetch(`${url}/transaction/${searchTransactionHash}`)

      // fetch(configHelper.apiUrl+'/transactions/'+ dummyAddress)
      .then((response) => {
        if (response && response.status < 400) {
          return response.json();
        }
        throw new Error((response.statusText || 'Internal Server Error'));
      })
      .then((responseJson) => {
        if (responseJson) {
          this.loadFantomTransactionData(responseJson);
        } else {
          this.setState({
            transactionData: [],
            error: 'No Record Found',
          });
        }
        return responseJson;
      })
      .catch((error) => {
        this.setState({
          transactionData: [],
          error: error.message || 'Internal Server Error',
        });
      });
  }

  /**
    * loadFantomTransactionData() :  Function to create array of objects from response of Api calling for storing transactions.
    * @param {*} responseJson : Json of transaction response data from Api.
    */
  loadFantomTransactionData(result) {
    let transactionData = [];
    transactionData.push({
      transaction_hash: result.transactionHash,
      Block_id: '',
      address_from: result.from,
      address_to: result.to,
      value: result.value,
      txFee: '',
      createdAt: '',
      gasUsed: result.gasUsed,
    });
    transactionData = transactionData.reverse();
    this.setState({
      transactionData,
    });
  }

  isValidHash(hash) {
    const validHashLength = 66;
    console.log('hash.length === validHashLength : ', hash.length === validHashLength);
    if (hash && hash.length === validHashLength) {
      return true;
    }
    return false;
  }
  searchHandler(e) {
    e.preventDefault();
    const { searchText } = this.state;

    if (searchText && searchText !== '') {
      const isValid = this.isValidHash(searchText);
      if (isValid) {
        this.getFantomTransactionsFromApiAsync(searchText);
        this.setState({
          error: '',
        });
      } else {
        this.setState({
          transactionData: [],
          error: 'Please enter valid hash.',
        });
      }
    }
  }

  render() {
    // let transactions = this.state.transactionArray;
    const { searchText, transactionData, error } = this.state;
    return (
      <div>
        <Header />
        <section className="bg-theme full-height-conatainer">
          <Container>
            {/*= ========= make this title-header component start=================*/}

            <Row className="title-header pt-3">
              <Col className="pt-3">
                <Title h2>Transaction</Title>
              </Col>
              <Col>
                <div className="form-element form-input">
                  <form autoComplete="off" onSubmit={(e) => this.searchHandler(e)}>
                    <input
                      value={searchText}
                      id="search"
                      className="form-element-field"
                      placeholder=" "
                      type="search"
                      required=""
                      onChange={(e) => this.setSearchText(e)}
                    />
                    <div className="form-element-bar" />
                    <label className="form-element-label" htmlFor="search"> Search by Txhash</label>
                  </form>

                </div>
              </Col>
            </Row>

            {/*= ========= make this title-header component end=================*/}

            <Row>
              {transactionData.length > 0 && <SearchForTransaction transactions={transactionData} />}
              {error !== '' && <p>{error}</p>}
              {/* <Col>
                <Table className="transactions-table">
                  <thead className="dark">
                    <tr>
                      <th>txHash</th>
                      {<th>Block</th>}
                      <th>Age</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Value</th>
                      <th>[TxFee]</th>
                    </tr>
                  </thead>
                  <tbody className="scroll-theme-1">
                    { transactions &&
                      transactions.length &&
                      transactions.length > 0 &&
                      transactions.map((data, index) => (
                        <tr key={index}>
                         <td className="text-black">
                            {data.transaction_hash}
                          </td>
                           <td className="text-black">{data.block_id}</td>
                          <td className="text-black">
                            {moment(parseInt(data.createdAt, 10)).fromNow()}
                          </td>
                       <td className="text-black">{data.address_from}</td>
                          <td className="text-black">{data.address_to}</td>
                          <td className="text-black">{data.value}</td>
                        <td className="text-black">{txFee}</td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              </Col> */}
            </Row>
          </Container>
        </section>
      </div>
    );
  }
}