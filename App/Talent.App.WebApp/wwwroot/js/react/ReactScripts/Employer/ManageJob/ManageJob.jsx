import React from 'react';
import ReactDOM from 'react-dom/client';
import Cookies from 'js-cookie';
import LoggedInBanner from '../../Layout/Banner/LoggedInBanner.jsx';
import { LoggedInNavigation } from '../../Layout/LoggedInNavigation.jsx';
import { JobSummaryCard } from './JobSummaryCard.jsx';
import { BodyWrapper, loaderData } from '../../Layout/BodyWrapper.jsx';
import { Checkbox, Dropdown, Icon, Card, Container, Pagination } from 'semantic-ui-react';

export default class ManageJob extends React.Component {
    constructor(props) {
        super(props);
        let loader = loaderData
        loader.allowedUsers.push("Employer");
        loader.allowedUsers.push("Recruiter");

        this.state = {
            loadJobs: [],
            loaderData: loader,
            activePage: 1,
            sortBy: {
                date: "desc"
            },
            filter: {
                showActive: true,
                showClosed: true,
                showDraft: true,
                showExpired: true,
                showUnexpired: true
            },
            totalPages: 1,
            activeIndex: "",
            pageSize: 3,
        }
        this.loadData = this.loadData.bind(this);
        this.init = this.init.bind(this);
        this.loadNewData = this.loadNewData.bind(this);
        this.handleSortFilter = this.handleSortFilter.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        //your functions go here
    };

    init() {
        let loaderData = TalentUtil.deepCopy(this.state.loaderData);
        loaderData.allowedUsers.push("Employer");
        loaderData.allowedUsers.push("Recruiter");

        //set loaderData.isLoading to false after getting data
        this.loadData(() => {
            loaderData.isLoading = false;
            this.setState({ loaderData });
        })
    }

    componentDidMount() {
        this.init();
    };

    loadData(callback) {
        var link = 'http://localhost:51689/listing/listing/getSortedEmployerJobs';
        var cookies = Cookies.get('talentAuthToken');
        // your ajax call and other logic goes here
        $.ajax({
            url: link,
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-type': 'application/json'
            },
            type: "GET",
            contentType: "application/json",
            dataType: "json",
            data: {
                activePage: this.state.activePage,
                sortbyDate: this.state.sortBy.date,
                showActive: this.state.filter.showActive,
                showClosed: this.state.filter.showClosed,
                showDraft: this.state.filter.showDraft,
                showExpired: this.state.filter.showExpired,
                showUnexpired: this.state.filter.showUnexpired,
                limit: this.state.pageSize
            },
            success: function(response) {
                let jobsData = null;
                if (response.myJobs) {
                    jobsData = response.myJobs;
                }
                let pages = Math.ceil(response.totalCount / this.state.pageSize);
                this.setState({loadJobs: jobsData, totalPages: pages}, () => {
                    if (callback) callback();
                })
            }.bind(this),
            error: function (response) {
                console.error('Error while retrieving jobs: ', response.status);
            }
        });
    }

    loadNewData(data) {
        let loader = this.state.loaderData;
        loader.isLoading = true;
        let newData = Object.assign({}, this.state, data);
        this.setState(newData, () => {
            this.loadData(() => {
                loader.isLoading = false;
                this.setState({
                    loaderData: loader
                })
            })
        });
    }

    handleSortFilter(event, evData) {
        let name = evData.name;
        let value = evData.value;

        let stateVar = "";
        if (name === "date") {
            stateVar = "sortBy";
        }
        else{
            name = value;
            stateVar = "filter";
            value = this.state.filter[name] ? false : true;
        }

        let newVarValue = {};
        newVarValue[name] = value;
        let stateVarValue = Object.assign({}, this.state[stateVar], newVarValue);
        let data = {};
        data[stateVar] = stateVarValue;
        this.loadNewData(data);
    }

    handlePageChange(event, evData) {
        let activePage = evData.activePage;
        this.setState({activePage: activePage}, () => {
            this.loadNewData();
        });
    }

    renderJobCards() {
        if (this.state.loadJobs.length === 0) {
            return <p>No Jobs Found</p>;
        }

        const jobCards = [];
        for (let i = 0; i < this.state.loadJobs.length; i++) {
            jobCards.push(<JobSummaryCard key={this.state.loadJobs[i].id} job={this.state.loadJobs[i]} />);
        }

        return <Card.Group>{jobCards}</Card.Group>
    }

    render() {
        const sortByOptions = [
            { key: 'desc', text: 'Newest first', value: 'desc' },
            { key: 'asc', text: 'Oldest first', value: 'asc' },
        ];
        const filterOptions = [
            { key: 'showActive', text: 'Show Active', value: 'showActive'},
            { key: 'showClosed', text: 'Show Closed', value: 'showClosed'},
            { key: 'showDraft', text: 'Show Draft', value: 'showDraft'},
            { key: 'showExpired', text: 'Show Expired', value: 'showExpired'},
            { key: 'showUnexpired', text: 'Show Unexpired', value: 'showUnexpired'}
        ];

        return (
            <BodyWrapper reload={this.init} loaderData={this.state.loaderData}>
                <Container>
                    <h1>List of Jobs</h1>
                    <div style={{ marginBottom: '10px'}}>
                        <Icon name='filter' />
                        <span>Filter: </span>
                        <Dropdown item simple text="Choose filter">
                            <Dropdown.Menu>
                                {filterOptions.map((option) => (
                                    <Dropdown.Item key={option.key}>
                                        <Checkbox
                                            label={option.text}
                                            checked={this.state.filter[option.value]}
                                            onChange={this.handleSortFilter}
                                            value={option.value}
                                        />
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>

                        <Icon name='calendar' />
                        <span>Sort by date: </span>
                        <Dropdown
                            inline
                            name="date"
                            options={sortByOptions}
                            value={this.state.sortBy.date}
                            onChange={this.handleSortFilter}
                            placeholder='Newest first'
                        />
                    </div>
                    {this.renderJobCards()}
                    <div style={{ textAlign: 'center', margin: '30px'}}>
                        <Pagination
                            activePage={this.state.activePage}
                            totalPages={this.state.totalPages}
                            onPageChange={this.handlePageChange}
                        />
                    </div>

                </Container>
            </BodyWrapper>
        )
    }
}