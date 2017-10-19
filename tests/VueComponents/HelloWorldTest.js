module.exports = class HelloWorldTest extends VueComponentTestCase
{
    /** @test */
    async it_is_able_to_change_the_component_text()
    {
        let component = this.render('<hello-world></hello-world>');
        this.assertEquals('<div>Hello World</div>', await component.toHtml());

        component.vm.changeText('Hello JSUnit');
        console.log(await component.toHtml());
        this.assertEquals('<div>Hello JSUnit</div>', await component.toHtml());
    }

    /** @test */
    async it_is_able_to_specify_a_text_color()
    {
        let component = this.render('<hello-world color="red"></hello-world>');
        console.log(await component.toHtml());
        this.assertEquals('<div class="red">Hello World</div>', await component.toHtml());
    }
}
