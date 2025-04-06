import React from 'react';
import Cookies from 'js-cookie';
import { Label, Icon, Button, ButtonGroup, Card, Popup } from 'semantic-ui-react';
import moment from 'moment';

export class JobSummaryCard extends React.Component {
    constructor(props) {
        super(props);
        this.selectJob = this.selectJob.bind(this)
    }


    selectJob(id) {
        var link = 'https://competitionservicestalent.azurewebsites.net/listing/listing/closeJob';
        var cookies = Cookies.get('talentAuthToken');
        //url: 'https://competitionservicestalent.azurewebsites.net/listing/listing/closeJob',
        $.ajax({
            url: link,
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-type': 'application/json'
            },
            type: "POST",
            data: JSON.stringify(id),
            success: function (res) {
                if (res.success == true) {
                    TalentUtil.notification.show(res.message, "success", null, null);
                    //window.location = "/ManageJobs";

                } else {
                    TalentUtil.notification.show(res.message, "error", null, null)
                }

            }.bind(this),
            error: function (res) {
                TalentUtil.notification.show(res.message, "error", null, null);
            }

        });
    }

    renderExpired(expirationDate) {
        const todayDate = new Date().toISOString();

        if (expirationDate < todayDate) {
            return <Button negative size='mini'>Expired</Button>;
        }
        else {
            return "";
        }
    }

    render() {
        const { job } = this.props;
        const id = job?.id;
        const title = job?.title;
        const locationCity = job?.location?.city;
        const locationCountry = job?.location?.country;
        const jobSummary = job?.summary;
        const noOfSuggestions = (job?.noOfSuggestions > 0) ? job.noOfSuggestions : 0;
        const expiryDate = job?.expiryDate ? job.expiryDate : null;

        return (
            <Card style={{ width: '350px', padding: '10px', height: '400px' }}>
                <Card.Content>
                    <Card.Header>{title}</Card.Header>
                    <Label as='a' color='black' ribbon='right' ><Icon name='user' />{noOfSuggestions}</Label>
                    <Card.Meta>{locationCity}, {locationCountry}</Card.Meta>
                    <Card.Description>
                        {jobSummary}
                    </Card.Description>
                </Card.Content>
                <Card.Content extra>
                    {this.renderExpired(expiryDate)}
                    <ButtonGroup size='mini' basic primary floated='right'>
                        <Button
                            onClick={() => {this.selectJob(id);}}
                        >
                            <Icon name='ban'></Icon>Close
                        </Button>
                        <Button
                            href={"/EditJob/" + id}
                        >
                            <Icon name='edit'></Icon>Edit
                        </Button>
                        <Button
                            href={"/PostJob/" + id}
                        >
                            <Icon name='copy'></Icon>Copy
                        </Button>
                    </ButtonGroup>
                </Card.Content>
            </Card>
        )
    }
}
